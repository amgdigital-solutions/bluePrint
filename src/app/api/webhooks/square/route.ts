import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

function validSignature(rawBody: string, signature: string | null, notificationUrl: string, key: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function normalizedStatus(value: unknown) {
  if (value === "ACTIVE") return "active";
  if (value === "PAUSED") return "paused";
  if (value === "CANCELED" || value === "DEACTIVATED") return "cancelled";
  if (value === "PENDING" || value === "FAILED") return "past_due";
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = `${process.env.NEXTAUTH_URL || new URL(request.url).origin}/api/webhooks/square`;
  if (!key || !validSignature(rawBody, request.headers.get("x-square-hmacsha256-signature"), notificationUrl, key)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });
  }

  try {
    const event = JSON.parse(rawBody) as { event_id?: string; type?: string; data?: { id?: string; object?: { subscription?: Record<string, unknown>; invoice?: Record<string, unknown> } } };
    if (!sql) return NextResponse.json({ received: true });

    const subscription = event.data?.object?.subscription;
    const invoice = event.data?.object?.invoice;
    const subscriptionId = typeof subscription?.id === "string" ? subscription.id : typeof invoice?.subscription_id === "string" ? invoice.subscription_id : event.data?.id;
    const status = normalizedStatus(subscription?.status);
    if (subscriptionId && status) {
      const rows = await sql`
        UPDATE subscriptions SET status = ${status}, current_period_start = ${typeof subscription?.start_date === "string" ? subscription.start_date : null}, current_period_end = ${typeof subscription?.charged_through_date === "string" ? subscription.charged_through_date : null}, updated_at = now()
        WHERE square_subscription_id = ${subscriptionId}
        RETURNING user_id, status
      `;
      if (rows[0]) {
        const memberActive = rows[0].status === "active";
        await sql`UPDATE profiles SET is_member = ${memberActive}, membership_expires_at = ${typeof subscription?.charged_through_date === "string" ? subscription.charged_through_date : null} WHERE id = ${rows[0].user_id}`;
      }
    }

    return NextResponse.json({ received: true, eventType: event.type || null, eventId: event.event_id || null });
  } catch (error) {
    console.error("Square webhook processing failed", error);
    return NextResponse.json({ error: "Webhook received but could not be processed." }, { status: 500 });
  }
}
