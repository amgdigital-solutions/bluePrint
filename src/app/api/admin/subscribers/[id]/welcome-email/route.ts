import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendMembershipPaymentReminderEmail, sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (session?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const rows = await sql`SELECT full_name, email FROM profiles WHERE id = ${params.id} AND is_member = true LIMIT 1`;
    const subscriber = rows[0] as { full_name: string; email: string } | undefined;
    if (!subscriber) return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
    const body = await request.json().catch(() => ({})) as { kind?: string };
    if (body.kind === "payment-reminder") {
      await sendMembershipPaymentReminderEmail({ name: subscriber.full_name, email: subscriber.email });
      return NextResponse.json({ ok: true, message: `Payment reminder sent to ${subscriber.email}.` });
    }
    await sendWelcomeEmail({ name: subscriber.full_name, email: subscriber.email });
    return NextResponse.json({ ok: true, message: `Welcome email sent to ${subscriber.email}.` });
  } catch (error) {
    console.error("Admin welcome email failed", error);
    return NextResponse.json({ error: "Unable to send the welcome email. Check the Resend configuration." }, { status: 502 });
  }
}
