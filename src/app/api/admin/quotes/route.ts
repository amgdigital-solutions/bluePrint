import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
const statuses = new Set(["new", "contacted", "quoted", "closed"]);

async function requireAdmin(request: Request) {
  const session = await getSessionFromRequest(request);
  return session?.role === "admin" ? session : null;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  return NextResponse.json({ quotes: await sql`SELECT * FROM quote_requests ORDER BY created_at DESC` });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!id || !statuses.has(status)) return NextResponse.json({ error: "A valid quote and status are required." }, { status: 400 });
  const rows = await sql`UPDATE quote_requests SET status = ${status} WHERE id = ${id} RETURNING *`;
  if (!rows[0]) return NextResponse.json({ error: "Quote request not found." }, { status: 404 });
  return NextResponse.json({ quote: rows[0] });
}
