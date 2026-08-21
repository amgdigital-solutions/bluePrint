import { NextResponse } from "next/server";

export const runtime = "nodejs";
const BUSINESS_LAT = 26.6834;
const BUSINESS_LNG = -80.0543;

function milesBetween(lat: number, lng: number) {
  const radius = 3959;
  const dLat = (lat - BUSINESS_LAT) * Math.PI / 180;
  const dLng = (lng - BUSINESS_LNG) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(BUSINESS_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (address.length < 5) return NextResponse.json({ error: "Please enter a complete address." }, { status: 400 });

    const query = new URLSearchParams({ q: address, format: "jsonv2", limit: "1", countrycodes: "us" });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
      headers: { "User-Agent": "BlueprintsClub/1.0 contact@blueprintsclub.com" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ error: "Address lookup is temporarily unavailable." }, { status: 502 });
    const results = await response.json();
    const location = results[0];
    if (!location) return NextResponse.json({ error: "We could not locate that address." }, { status: 404 });

    return NextResponse.json({
      distance: Number(milesBetween(Number(location.lat), Number(location.lon)).toFixed(1)),
      displayName: location.display_name,
    });
  } catch (error) {
    console.error("Distance lookup failed", error);
    return NextResponse.json({ error: "Unable to calculate distance right now." }, { status: 500 });
  }
}
