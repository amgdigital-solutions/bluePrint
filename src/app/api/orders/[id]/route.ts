import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
const allowedStatuses = new Set(["pending", "processing", "printing", "ready", "delivered", "cancelled"]);

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const body = await request.json();
  const status = typeof body.status === "string" ? body.status : "";
  if (!allowedStatuses.has(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });

  const rows = await sql`
    UPDATE orders
    SET status = ${status}
    WHERE id = ${context.params.id}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order: rows[0] });
}
