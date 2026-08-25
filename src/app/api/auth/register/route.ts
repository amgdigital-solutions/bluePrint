import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { createSessionToken, AUTH_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    if (fullName.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (address.length < 8) return NextResponse.json({ error: "Please enter your delivery address." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const existing = await sql`SELECT id FROM profiles WHERE lower(email) = ${email} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await hash(password, 12);
    const rows = await sql`
      INSERT INTO profiles (email, password_hash, full_name, phone, address)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${phone || null}, ${address})
      RETURNING id, email, full_name, role
    `;
    const user = rows[0] as { id: string; email: string; full_name: string; role: "user" | "admin" };
    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.full_name, role: user.role });

    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.full_name, role: user.role } }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, sessionCookieOptions(true));
    return response;
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
