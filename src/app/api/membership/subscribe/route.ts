import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const plans = {
  monthly: { tier: "monthly", variation: "SQUARE_MONTHLY_PLAN_VARIATION_ID" },
  "6month": { tier: "6month", variation: "SQUARE_6MONTH_PLAN_VARIATION_ID" },
  yearly: { tier: "yearly", variation: "SQUARE_YEARLY_PLAN_VARIATION_ID" },
} as const;

const BUSINESS_LAT = 26.6834;
const BUSINESS_LNG = -80.0543;

function milesBetween(lat: number, lng: number) {
  const radius = 3959;
  const dLat = (lat - BUSINESS_LAT) * Math.PI / 180;
  const dLng = (lng - BUSINESS_LNG) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(BUSINESS_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Please sign in before joining the Club." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json();
    const requestedTier = typeof body.tier === "string" ? body.tier : "";
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";
    const tier = requestedTier in plans ? requestedTier as keyof typeof plans : null;
    const plan = tier ? plans[tier] : null;
    if (!plan) return NextResponse.json({ error: "Choose a valid membership plan." }, { status: 400 });

    const profileRows = await sql`SELECT id, email, full_name, phone, company, address FROM profiles WHERE id = ${session.userId} LIMIT 1`;
    const profile = profileRows[0];
    const variationId = process.env[plan.variation];
    const token = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const applicationId = process.env.SQUARE_APPLICATION_ID;
    if (!profile || !variationId || !token || !locationId || !applicationId) return NextResponse.json({ error: "Square membership setup is incomplete." }, { status: 503 });
    if (!sourceId) return NextResponse.json({ error: "Secure card details are required to start membership." }, { status: 400 });
    if (!profile.address || String(profile.address).trim().length < 5) return NextResponse.json({ error: "A verified delivery address within 10 miles is required before joining." }, { status: 400 });
    const addressQuery = new URLSearchParams({ q: String(profile.address), format: "jsonv2", limit: "1", countrycodes: "us" });
    const addressResponse = await fetch(`https://nominatim.openstreetmap.org/search?${addressQuery}`, { headers: { "User-Agent": "BlueprintsClub/1.0 contact@blueprintsclub.com" }, next: { revalidate: 3600 } });
    const addressResults = addressResponse.ok ? await addressResponse.json() : [];
    const location = addressResults[0];
    if (!location) return NextResponse.json({ error: "We could not verify that delivery address." }, { status: 400 });
    const addressDistance = Number(milesBetween(Number(location.lat), Number(location.lon)).toFixed(1));
    if (addressDistance > 10) return NextResponse.json({ error: `This address is ${addressDistance} miles away. Membership requires an address within 10 miles.` }, { status: 400 });

    const baseUrl = process.env.SQUARE_ENVIRONMENT === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
    const headers = { Authorization: `Bearer ${token}`, "Square-Version": "2026-08-19", "Content-Type": "application/json" };
    const customerResponse = await fetch(`${baseUrl}/v2/customers`, { method: "POST", headers, body: JSON.stringify({ idempotency_key: randomUUID(), given_name: profile.full_name, email_address: profile.email, phone_number: profile.phone || undefined, company_name: profile.company || undefined, reference_id: profile.id }) });
    const customerResult = await customerResponse.json();
    if (!customerResponse.ok || !customerResult.customer?.id) return NextResponse.json({ error: customerResult.errors?.[0]?.detail || "Square could not create the customer record." }, { status: 502 });

    const cardResponse = await fetch(`${baseUrl}/v2/cards`, { method: "POST", headers, body: JSON.stringify({ idempotency_key: randomUUID(), source_id: sourceId, card: { customer_id: customerResult.customer.id, reference_id: profile.id, cardholder_name: profile.full_name } }) });
    const cardResult = await cardResponse.json();
    if (!cardResponse.ok || !cardResult.card?.id) return NextResponse.json({ error: cardResult.errors?.[0]?.detail || "Square could not securely save that card." }, { status: 502 });

    const subscriptionResponse = await fetch(`${baseUrl}/v2/subscriptions`, { method: "POST", headers, body: JSON.stringify({ idempotency_key: randomUUID(), location_id: locationId, plan_variation_id: variationId, customer_id: customerResult.customer.id, card_id: cardResult.card.id, timezone: "America/New_York", source: { name: "Blueprints Club website" } }) });
    const subscriptionResult = await subscriptionResponse.json();
    if (!subscriptionResponse.ok || !subscriptionResult.subscription?.id) return NextResponse.json({ error: subscriptionResult.errors?.[0]?.detail || "Square could not create the subscription." }, { status: 502 });

    const subscription = subscriptionResult.subscription;
    await sql`INSERT INTO subscriptions (user_id, square_subscription_id, status, tier, current_period_start, current_period_end) VALUES (${profile.id}, ${subscription.id}, 'active', ${plan.tier}, ${subscription.start_date || null}, ${subscription.charged_through_date || null}) ON CONFLICT (square_subscription_id) DO UPDATE SET status = 'active', tier = ${plan.tier}, updated_at = now()`;
    await sql`UPDATE profiles SET is_member = true, membership_tier = ${plan.tier}, membership_expires_at = ${subscription.charged_through_date || null} WHERE id = ${profile.id}`;
    return NextResponse.json({ subscription: { id: subscription.id, tier: plan.tier, status: subscription.status }, message: "Membership started. Your card was saved securely, and the first charge will occur after the complimentary month." }, { status: 201 });
  } catch (error) {
    console.error("Membership subscription failed", error);
    return NextResponse.json({ error: "Unable to start membership right now." }, { status: 500 });
  }
}
