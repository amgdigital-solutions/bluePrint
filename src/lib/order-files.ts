import { del } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function deleteOrderFiles(orderId: string) {
  if (!sql) throw new Error("Database is not configured.");
  const rows = await sql`
    SELECT file_url FROM order_files WHERE order_id = ${orderId}
    UNION
    SELECT file_url FROM orders WHERE id = ${orderId} AND file_url IS NOT NULL
  `;
  const urls = Array.from(new Set(rows.map((row) => String(row.file_url)).filter(Boolean)));
  if (urls.length) await del(urls);
  await sql`DELETE FROM order_files WHERE order_id = ${orderId}`;
  await sql`UPDATE orders SET file_url = NULL, file_name = NULL, files_deleted_at = now() WHERE id = ${orderId}`;
  return urls.length;
}
