import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!sql) return NextResponse.json({ settings: {} });
  const rows = await sql`SELECT setting_key, setting_value FROM business_settings`;
  return NextResponse.json({ settings: Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])) });
}

export async function PATCH(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const settings = body.settings && typeof body.settings === "object" ? body.settings as Record<string, unknown> : {};
    const allowed = ["business_name", "business_address", "business_phone", "business_email", "delivery_radius_miles", "min_order_delivery", "construction_site_fee", "bw_price", "bw_member_price", "color_price", "color_member_price", "digitizing_price"];
    for (const key of allowed) {
      if (typeof settings[key] !== "string") continue;
      await sql`INSERT INTO business_settings (setting_key, setting_value, updated_at) VALUES (${key}, ${settings[key]}, now()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now()`;
    }
    const rows = await sql`SELECT setting_key, setting_value FROM business_settings`;
    return NextResponse.json({ settings: Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])) });
  } catch (error) {
    console.error("Settings update failed", error);
    return NextResponse.json({ error: "Unable to save settings right now." }, { status: 500 });
  }
}
