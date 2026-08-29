import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendQuoteRequestEmails } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json();
    const productName = typeof body.productName === "string" ? body.productName.trim() : "";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : null;
    const details = typeof body.details === "string" ? body.details.trim() : null;
    const sampleName = typeof body.sampleName === "string" ? body.sampleName.trim() : null;
    const sampleImage = typeof body.sampleImage === "string" ? body.sampleImage.trim() : null;

    if (!productName || !customerName || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Product, name, and a valid email are required." }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO quote_requests (product_name, customer_name, customer_email, customer_phone, details, sample_name, sample_image)
      VALUES (${productName}, ${customerName}, ${customerEmail}, ${customerPhone}, ${details}, ${sampleName}, ${sampleImage})
      RETURNING id, product_name, customer_name, customer_email, customer_phone, details, sample_name, sample_image, status, created_at
    `;

    try {
      await sendQuoteRequestEmails({ productName, sampleName, customerName, customerEmail, customerPhone, details });
    } catch (emailError) {
      console.error("Quote email delivery failed", emailError);
    }

    return NextResponse.json({ quote: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Quote request failed", error);
    return NextResponse.json({ error: "Unable to submit your quote request right now." }, { status: 500 });
  }
}
