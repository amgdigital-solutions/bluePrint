import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const applicationId = process.env.SQUARE_APPLICATION_ID?.trim() || "";
  const locationId = process.env.SQUARE_LOCATION_ID?.trim() || "";
  const environment = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === "production" ? "production" : "sandbox";
  if (!applicationId || !locationId) return NextResponse.json({ error: "Square card setup is incomplete." }, { status: 503 });
  return NextResponse.json({ applicationId, locationId, environment });
}
