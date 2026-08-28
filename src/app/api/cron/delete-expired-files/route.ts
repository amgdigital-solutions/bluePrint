import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { deleteOrderFiles } from "@/lib/order-files";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const expiredOrders = await sql`
    SELECT o.id
    FROM orders o
    WHERE o.files_deleted_at IS NULL
      AND (
        EXISTS (
          SELECT 1 FROM order_files f
          WHERE f.order_id = o.id AND f.created_at < now() - interval '30 days'
        )
        OR (o.file_url IS NOT NULL AND o.created_at < now() - interval '30 days')
      )
    ORDER BY o.created_at
    LIMIT 100
  `;

  let deletedFiles = 0;
  const failures: string[] = [];
  for (const order of expiredOrders) {
    try {
      deletedFiles += await deleteOrderFiles(String(order.id));
    } catch (error) {
      console.error("Expired order file cleanup failed", { orderId: order.id, error });
      failures.push(String(order.id));
    }
  }

  return NextResponse.json({ processedOrders: expiredOrders.length, deletedFiles, failures });
}
