import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const [stats, recentOrders] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*)::int FROM profiles WHERE is_member = true) AS subscribers,
        (SELECT count(*)::int FROM orders) AS orders,
        (SELECT COALESCE(sum(total_amount), 0)::numeric FROM orders WHERE status <> ${"cancelled"}) AS revenue,
        (SELECT count(*)::int FROM orders WHERE status IN (${"pending"}, ${"processing"}, ${"printing"}, ${"ready"})) AS pending_orders
    `,
    sql`
      SELECT order_number, customer_name, created_at, status, total_amount
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `,
  ]);

  return NextResponse.json({ stats: stats[0], recentOrders });
}
