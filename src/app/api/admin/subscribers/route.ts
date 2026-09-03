import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const subscribers = await sql`
    SELECT p.id, p.full_name, p.email, p.phone, p.membership_tier,
      COALESCE(p.membership_expires_at, CASE p.membership_tier
        WHEN 'monthly' THEN p.created_at + INTERVAL '7 months'
        WHEN '6month' THEN p.created_at + INTERVAL '6 months'
        WHEN 'yearly' THEN p.created_at + INTERVAL '12 months'
        ELSE NULL
      END) AS membership_expires_at,
      p.created_at, COALESCE(COUNT(o.id), 0)::int AS orders,
      COALESCE(s.status::text, CASE WHEN p.is_member THEN 'active' ELSE 'cancelled' END) AS status
    FROM profiles p
    LEFT JOIN orders o ON o.user_id = p.id
    LEFT JOIN LATERAL (
      SELECT status FROM subscriptions WHERE user_id = p.id ORDER BY updated_at DESC LIMIT 1
    ) s ON true
    WHERE p.is_member = true OR s.status IS NOT NULL
    GROUP BY p.id, s.status
    ORDER BY p.membership_expires_at DESC NULLS LAST, p.created_at DESC
  `;

  return NextResponse.json({ subscribers });
}
