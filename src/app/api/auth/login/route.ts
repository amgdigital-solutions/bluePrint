import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sql } from "@/lib/db";
import { createSessionToken, AUTH_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rememberMe = body.rememberMe !== false;

    if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const rows = await sql`
      SELECT id, email, password_hash, full_name, role
      FROM profiles
      WHERE lower(email) = ${email}
      LIMIT 1
    `;
    const user = rows[0] as { id: string; email: string; password_hash: string; full_name: string; role: "user" | "admin" } | undefined;
    if (!user || !user.password_hash || !(await compare(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.full_name, role: user.role }, rememberMe);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.full_name, role: user.role } });
    response.cookies.set(AUTH_COOKIE, token, sessionCookieOptions(rememberMe));
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
