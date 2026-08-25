import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const fileId = new URL(request.url).searchParams.get("fileId");
  const rows = fileId
    ? await sql`
        SELECT o.user_id, f.file_url, f.file_name
        FROM order_files f JOIN orders o ON o.id = f.order_id
        WHERE f.id = ${fileId} AND f.order_id = ${context.params.id} LIMIT 1
      `
    : await sql`SELECT user_id, file_url, file_name FROM orders WHERE id = ${context.params.id} LIMIT 1`;
  const order = rows[0] as { user_id: string | null; file_url: string | null; file_name: string | null } | undefined;
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (session.role !== "admin" && order.user_id !== session.userId) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  if (!order.file_url) return NextResponse.json({ error: "No file is attached to this order." }, { status: 404 });

  const blob = await get(order.file_url, { access: "private" });
  if (!blob || blob.statusCode !== 200 || !blob.stream) return NextResponse.json({ error: "File unavailable." }, { status: 404 });

  const safeName = (order.file_name || "blueprint-file").replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(blob.stream, {
    status: 200,
    headers: {
      "Content-Type": blob.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
