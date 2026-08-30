import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { hashPasswordResetToken } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!sql || !token || password.length < 8) return NextResponse.json({ error: "A valid reset link and password of at least 8 characters are required." }, { status: 400 });
    const rows = await sql`UPDATE password_reset_tokens SET used_at = now() WHERE token_hash = ${hashPasswordResetToken(token)} AND used_at IS NULL AND expires_at > now() RETURNING user_id`;
    if (!rows[0]) return NextResponse.json({ error: "This reset link is invalid or expired. Please request a new one." }, { status: 400 });
    await sql`UPDATE profiles SET password_hash = ${await hash(password, 12)} WHERE id = ${rows[0].user_id} AND is_active = true`;
    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Unable to reset your password right now." }, { status: 500 });
  }
}
