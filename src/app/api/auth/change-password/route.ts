import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    const rows = await sql`SELECT password_hash FROM profiles WHERE id = ${session.userId} AND is_active = true LIMIT 1`;
    if (!rows[0] || !(await compare(currentPassword, rows[0].password_hash))) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    await sql`UPDATE profiles SET password_hash = ${await hash(newPassword, 12)} WHERE id = ${session.userId}`;
    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Password change failed", error);
    return NextResponse.json({ error: "Unable to change your password right now." }, { status: 500 });
  }
}
