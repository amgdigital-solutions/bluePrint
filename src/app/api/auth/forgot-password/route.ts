import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const generic = { message: "If an account exists for that email, a reset link has been sent." };
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!sql || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json(generic);
    const rows = await sql`SELECT id, full_name, email FROM profiles WHERE lower(email) = ${email} AND is_active = true LIMIT 1`;
    if (!rows[0]) return NextResponse.json(generic);
    const { token, tokenHash } = createPasswordResetToken();
    await sql`UPDATE password_reset_tokens SET used_at = now() WHERE user_id = ${rows[0].id} AND used_at IS NULL`;
    await sql`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (${rows[0].id}, ${tokenHash}, now() + interval '1 hour')`;
    const baseUrl = (process.env.NEXTAUTH_URL || "https://www.blueprintsclub.com").replace(/\/$/, "");
    await sendPasswordResetEmail({ name: rows[0].full_name, email: rows[0].email, resetUrl: `${baseUrl}/reset-password?token=${encodeURIComponent(token)}` });
    return NextResponse.json(generic);
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json(generic);
  }
}
