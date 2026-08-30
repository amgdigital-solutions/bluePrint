import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

async function requireAdmin(request: Request) {
  const session = await getSessionFromRequest(request);
  return session?.role === "admin" ? session : null;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  return NextResponse.json({ users: await sql`SELECT id, email, full_name, phone, role, is_active, created_at FROM profiles WHERE role = 'admin' ORDER BY created_at ASC` });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return NextResponse.json({ error: "Name, valid email, and a password of at least 8 characters are required." }, { status: 400 });
    const rows = await sql`INSERT INTO profiles (email, password_hash, full_name, role, is_active) VALUES (${email}, ${await hash(password, 12)}, ${fullName}, 'admin', true) RETURNING id, email, full_name, role, is_active, created_at`;
    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin creation failed", error);
    return NextResponse.json({ error: "Unable to add that admin. The email may already be in use." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const isActive = body.isActive === true;
    if (!id || id === session.userId) return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
    if (!isActive) {
      const count = await sql`SELECT count(*)::int AS count FROM profiles WHERE role = 'admin' AND is_active = true`;
      if (Number(count[0]?.count) <= 1) return NextResponse.json({ error: "Keep at least one active admin account." }, { status: 400 });
    }
    const rows = await sql`UPDATE profiles SET is_active = ${isActive} WHERE id = ${id} AND role = 'admin' RETURNING id, email, full_name, role, is_active, created_at`;
    if (!rows[0]) return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error("Admin status update failed", error);
    return NextResponse.json({ error: "Unable to update that admin account." }, { status: 500 });
  }
}
