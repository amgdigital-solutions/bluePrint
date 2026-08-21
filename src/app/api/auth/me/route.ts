import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`))?.[1];
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: session });
}
