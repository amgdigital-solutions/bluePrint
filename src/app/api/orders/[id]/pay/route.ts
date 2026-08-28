import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { createSquarePayment } from "@/lib/square";
import { sendPaidOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json();
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";
    if (!sourceId) return NextResponse.json({ error: "Secure card details are required." }, { status: 400 });

    const rows = await sql`
      SELECT * FROM orders
      WHERE id = ${context.params.id}
        AND (${session.role === "admin"} OR user_id = ${session.userId})
      LIMIT 1
    `;
    const order = rows[0];
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.payment_status === "paid") return NextResponse.json({ paid: true, orderReference: order.order_group_id });

    const groupOrders = await sql`SELECT * FROM orders WHERE order_group_id = ${order.order_group_id} ORDER BY created_at ASC`;
    const amountCents = Math.round(groupOrders.reduce((sum, item) => sum + Number(item.total_amount), 0) * 100);
    const payment = await createSquarePayment({
      orderReference: String(order.order_group_id),
      amountCents,
      buyerEmail: String(order.customer_email),
      sourceId,
    });
    const localStatus = payment.status === "COMPLETED" ? "paid" : payment.status === "FAILED" || payment.status === "CANCELED" ? "failed" : "pending";
    await sql`
      UPDATE orders SET payment_status = ${localStatus}, square_payment_id = ${payment.id}, square_order_id = COALESCE(${payment.orderId}, square_order_id), paid_at = CASE WHEN ${localStatus} = 'paid' THEN COALESCE(paid_at, now()) ELSE paid_at END
      WHERE order_group_id = ${order.order_group_id}
    `;

    if (localStatus === "paid") {
      try {
        await sendPaidOrderEmails({
          orderReference: String(order.order_group_id),
          customerName: String(order.customer_name),
          customerEmail: String(order.customer_email),
          total: amountCents / 100,
          deliveryType: order.delivery_type ? String(order.delivery_type) : null,
          receiptUrl: payment.receiptUrl,
        });
        await sql`UPDATE orders SET confirmation_email_sent_at = now() WHERE order_group_id = ${order.order_group_id}`;
      } catch (emailError) {
        console.error("Paid order email failed", emailError);
      }
    }
    return NextResponse.json({ paid: localStatus === "paid", paymentStatus: localStatus, paymentId: payment.id, orderReference: order.order_group_id });
  } catch (error) {
    console.error("Square payment failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process payment." }, { status: 502 });
  }
}
