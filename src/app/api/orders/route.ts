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
        SELECT o.*, p.full_name AS profile_name,
          COALESCE((SELECT json_agg(of ORDER BY of.created_at) FROM order_files of WHERE of.order_id = o.id), '[]'::json) AS files
        FROM orders o
        LEFT JOIN profiles p ON p.id = o.user_id
        ORDER BY o.created_at DESC
      `
    : await sql`
        SELECT o.*, COALESCE((SELECT json_agg(of ORDER BY of.created_at) FROM order_files of WHERE of.order_id = o.id), '[]'::json) AS files
        FROM orders o WHERE o.user_id = ${session.userId} ORDER BY o.created_at DESC
      `;

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
    const uploadedFiles = Array.isArray(body.files) ? body.files : [];
    const items = uploadedFiles.length
      ? uploadedFiles
          .filter((file: unknown): file is { printType?: unknown; pageCount?: unknown; sets?: unknown } => Boolean(file && typeof file === "object"))
          .reduce((groups: Array<{ printType: unknown; quantity: number }>, file: { printType?: unknown; pageCount?: unknown; sets?: unknown }) => {
            const existing = groups.find((item) => item.printType === file.printType);
            const quantity = Number(file.pageCount) * Number(file.sets);
            if (existing) existing.quantity += quantity;
            else groups.push({ printType: file.printType, quantity });
            return groups;
          }, [])
      : (Array.isArray(body.items) ? body.items : [{ printType: body.printType, quantity: body.quantity }]);
    const isConstructionSite = body.isConstructionSite === true;
    const deliveryAddress = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : null;
    const distanceMiles = body.distanceMiles == null ? null : Number(body.distanceMiles);
    const deliveryChoice = body.deliveryChoice === "delivery" ? "delivery" : "pickup";

    if (!customerName || !/^\S+@\S+\.\S+$/.test(customerEmail) || !customerPhone) {
      return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }
    const normalizedItems = items.map((item: { printType?: unknown; quantity?: unknown }) => ({ printType: item.printType, quantity: Number(item.quantity) })).filter((item: { printType: unknown; quantity: number }) => isPrintType(item.printType) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 10000);
    if (!normalizedItems.length || normalizedItems.length !== items.length) {
      return NextResponse.json({ error: "Please provide a valid print type and quantity." }, { status: 400 });
    }
    if (distanceMiles !== null && (!Number.isFinite(distanceMiles) || distanceMiles < 0)) {
      return NextResponse.json({ error: "Please provide a valid delivery distance." }, { status: 400 });
    }

    const normalizedFiles = uploadedFiles.map((file: { fileName?: unknown; fileUrl?: unknown; printType?: unknown; pageCount?: unknown; sets?: unknown }) => ({
      fileName: typeof file.fileName === "string" ? file.fileName.trim() : "",
      fileUrl: typeof file.fileUrl === "string" && file.fileUrl.startsWith("https://") ? file.fileUrl : "",
      printType: file.printType,
      pageCount: Number(file.pageCount),
      sets: Number(file.sets),
    }));
    const legacyFileName = typeof body.fileName === "string" ? body.fileName.trim() : null;
    const legacyFileUrl = typeof body.fileUrl === "string" && body.fileUrl.startsWith("https://") ? body.fileUrl : null;
    if (uploadedFiles.length && (!normalizedFiles.length || normalizedFiles.some((file: { fileName: string; fileUrl: string; printType: unknown; pageCount: number; sets: number }) => !file.fileName || !file.fileUrl || !isPrintType(file.printType) || !Number.isInteger(file.pageCount) || file.pageCount < 1 || !Number.isInteger(file.sets) || file.sets < 1 || file.pageCount * file.sets > 10000))) {
      return NextResponse.json({ error: "Each uploaded file needs a valid name, private link, print type, page count, and number of sets." }, { status: 400 });
    }

    let isMember = false;
    if (session) {
      const members = await sql`SELECT is_member FROM profiles WHERE id = ${session.userId} LIMIT 1`;
      isMember = members[0]?.is_member === true;
    }

    const cartSubtotal = Number(normalizedItems.reduce((sum: number, item: { printType: keyof typeof prices; quantity: number }) => sum + (isMember ? prices[item.printType].member : prices[item.printType].regular) * item.quantity, 0).toFixed(2));
    if (deliveryChoice === "delivery" && (!isMember || cartSubtotal < 50 || distanceMiles === null || distanceMiles > 10 || !deliveryAddress)) {
      return NextResponse.json({ error: "Delivery is available to members on $50+ orders within 10 miles. Please choose pickup or call us for special delivery." }, { status: 400 });
    }
    const deliveryFee = deliveryChoice === "delivery" && isConstructionSite ? 15 : 0;
    const deliveryType = deliveryChoice === "delivery" ? (isConstructionSite ? "construction_site" : "delivery") : "pickup";
    const orderNumberBase = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    const orders = [];
    for (const [index, item] of normalizedItems.entries()) {
      const printType = item.printType as keyof typeof prices;
      const quantity = item.quantity;
      const unitPrice = isMember ? prices[printType].member : prices[printType].regular;
      const subtotal = Number((unitPrice * quantity).toFixed(2));
      const totalAmount = Number((subtotal + (normalizedItems[0] === item ? deliveryFee : 0)).toFixed(2));
      const rows = await sql`
        INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        print_type, quantity, unit_price, total_amount, delivery_fee,
        delivery_type, delivery_address, distance_miles, is_construction_site,
        file_url, file_name, notes
        ) VALUES (
        ${normalizedItems.length > 1 ? `${orderNumberBase}-${index + 1}` : orderNumberBase}, ${session?.userId || null}, ${customerName}, ${customerEmail}, ${customerPhone},
        ${printType}, ${quantity}, ${unitPrice}, ${totalAmount}, ${normalizedItems[0] === item ? deliveryFee : 0},
        ${deliveryType}, ${deliveryAddress}, ${distanceMiles}, ${isConstructionSite},
        ${normalizedFiles.find((file: { printType: unknown }) => file.printType === printType)?.fileUrl || legacyFileUrl}, ${normalizedFiles.find((file: { printType: unknown }) => file.printType === printType)?.fileName || legacyFileName}, ${notes}
      )
        RETURNING *
      `;
      orders.push(rows[0]);
      if (normalizedFiles.length) {
        for (const file of normalizedFiles.filter((candidate: { printType: unknown }) => candidate.printType === printType)) {
          await sql`
            INSERT INTO order_files (order_id, file_url, file_name, print_type, page_count, sets, sheet_count)
            VALUES (${rows[0].id}, ${file.fileUrl}, ${file.fileName}, ${printType}, ${file.pageCount}, ${file.sets}, ${file.pageCount * file.sets})
          `;
        }
      }
    }

    return NextResponse.json({ order: orders[0], orders }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Unable to submit your order right now." }, { status: 500 });
  }
}
