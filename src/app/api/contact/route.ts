import { NextResponse } from "next/server";
import { sendContactMessageEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = typeof body.name === "string" ? body.name.trim() : "";
    const customerEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const customerPhone = typeof body.phone === "string" ? body.phone.trim() : null;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!customerName || !/^\S+@\S+\.\S+$/.test(customerEmail) || !message) {
      return NextResponse.json({ error: "Name, a valid email, and a message are required." }, { status: 400 });
    }
    if (customerName.length > 120 || customerEmail.length > 320 || message.length > 5000) {
      return NextResponse.json({ error: "Please shorten the message and try again." }, { status: 400 });
    }

    await sendContactMessageEmail({ customerName, customerEmail, customerPhone, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact message delivery failed", error);
    return NextResponse.json({ error: "Unable to send your message right now. Please call us at +1 561-804-9110." }, { status: 500 });
  }
}
