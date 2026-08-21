import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const rows = await sql`SELECT id, email, full_name, phone, company, address, is_member, membership_tier, membership_expires_at FROM profiles WHERE id = ${session.userId} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  return NextResponse.json({ profile: rows[0] });
}

export async function PATCH(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const company = typeof body.company === "string" ? body.company.trim() : null;
    const address = typeof body.address === "string" ? body.address.trim() : null;
    if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
    const conflict = await sql`SELECT id FROM profiles WHERE lower(email) = ${email} AND id <> ${session.userId} LIMIT 1`;
    if (conflict.length) return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    const rows = await sql`UPDATE profiles SET full_name = ${fullName}, email = ${email}, phone = ${phone}, company = ${company}, address = ${address} WHERE id = ${session.userId} RETURNING id, email, full_name, phone, company, address, is_member, membership_tier, membership_expires_at`;
    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "Unable to update your profile." }, { status: 500 });
  }
}
