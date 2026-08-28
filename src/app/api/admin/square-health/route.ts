import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getSquareHealth } from "@/lib/square";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const health = await getSquareHealth();
    return NextResponse.json(health, {
      status: health.ok ? 200 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Square health check failed", error);
    return NextResponse.json({ error: "Square health check failed." }, { status: 502 });
  }
}
