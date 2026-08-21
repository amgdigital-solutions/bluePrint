import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const prices = { bw: { regular: 2.99, member: 1.99 }, color: { regular: 6.95, member: 5.95 } } as const;
const statuses = ["pending", "processing", "printing", "ready", "delivered", "cancelled"] as const;

function isPrintType(value: unknown): value is keyof typeof prices {
  return value === "bw" || value === "color";
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const url = new URL(request.url);
  const allOrders = url.searchParams.get("scope") === "all";
  if (allOrders && session.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const rows = allOrders
    ? await sql`
        SELECT o.*, p.full_name AS profile_name
        FROM orders o
        LEFT JOIN profiles p ON p.id = o.user_id
        ORDER BY o.created_at DESC
      `
    : await sql`SELECT * FROM orders WHERE user_id = ${session.userId} ORDER BY created_at DESC`;

  return NextResponse.json({ orders: rows });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json();
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : null;
    const printType = body.printType;
    const quantity = Number(body.quantity);
    const isConstructionSite = body.isConstructionSite === true;
    const deliveryAddress = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : null;
    const distanceMiles = body.distanceMiles == null ? null : Number(body.distanceMiles);

    if (!customerName || !/^\S+@\S+\.\S+$/.test(customerEmail) || !customerPhone) {
      return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }
    if (!isPrintType(printType) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      return NextResponse.json({ error: "Please provide a valid print type and quantity." }, { status: 400 });
    }
    if (distanceMiles !== null && (!Number.isFinite(distanceMiles) || distanceMiles < 0)) {
      return NextResponse.json({ error: "Please provide a valid delivery distance." }, { status: 400 });
    }

    let isMember = false;
    if (session) {
      const members = await sql`SELECT is_member FROM profiles WHERE id = ${session.userId} LIMIT 1`;
      isMember = members[0]?.is_member === true;
    }

    const unitPrice = isMember ? prices[printType].member : prices[printType].regular;
    const subtotal = Number((unitPrice * quantity).toFixed(2));
    const deliveryFee = isConstructionSite ? 15 : 0;
    const totalAmount = Number((subtotal + deliveryFee).toFixed(2));
    const deliveryType = isConstructionSite ? "construction_site" : deliveryAddress ? "delivery" : "pickup";
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const fileName = typeof body.fileName === "string" ? body.fileName.trim() : null;
    const fileUrl = typeof body.fileUrl === "string" && body.fileUrl.startsWith("https://") ? body.fileUrl : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    const rows = await sql`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        print_type, quantity, unit_price, total_amount, delivery_fee,
        delivery_type, delivery_address, distance_miles, is_construction_site,
        file_url, file_name, notes
      ) VALUES (
        ${orderNumber}, ${session?.userId || null}, ${customerName}, ${customerEmail}, ${customerPhone},
        ${printType}, ${quantity}, ${unitPrice}, ${totalAmount}, ${deliveryFee},
        ${deliveryType}, ${deliveryAddress}, ${distanceMiles}, ${isConstructionSite},
        ${fileUrl}, ${fileName}, ${notes}
      )
      RETURNING *
    `;

    return NextResponse.json({ order: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Unable to submit your order right now." }, { status: 500 });
  }
}
