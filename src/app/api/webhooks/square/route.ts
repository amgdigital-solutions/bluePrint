import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { sql } from "@/lib/db";
import { sendPaidOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

function validSignature(rawBody: string, signature: string | null, notificationUrl: string, key: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function normalizedStatus(value: unknown) {
  if (value === "ACTIVE") return "active";
  if (value === "PAUSED") return "paused";
  if (value === "CANCELED" || value === "DEACTIVATED") return "cancelled";
  if (value === "PENDING" || value === "FAILED") return "past_due";
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const notificationUrls = Array.from(new Set([
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL,
    `${new URL(request.url).origin}/api/webhooks/square`,
    process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.replace(/\/$/, "")}/api/webhooks/square` : null,
  ].filter((value): value is string => Boolean(value))));
  if (!key || !notificationUrls.some((url) => validSignature(rawBody, signature, url, key))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });
  }

  try {
    const event = JSON.parse(rawBody) as { event_id?: string; type?: string; data?: { id?: string; object?: { subscription?: Record<string, unknown>; invoice?: Record<string, unknown>; payment?: Record<string, unknown> } } };
    if (!sql) return NextResponse.json({ received: true });

    const subscription = event.data?.object?.subscription;
    const invoice = event.data?.object?.invoice;
    const subscriptionId = typeof subscription?.id === "string" ? subscription.id : typeof invoice?.subscription_id === "string" ? invoice.subscription_id : event.data?.id;
    const status = normalizedStatus(subscription?.status);
    if (subscriptionId && status) {
      const rows = await sql`
        UPDATE subscriptions SET status = ${status}, current_period_start = ${typeof subscription?.start_date === "string" ? subscription.start_date : null}, current_period_end = ${typeof subscription?.charged_through_date === "string" ? subscription.charged_through_date : null}, updated_at = now()
        WHERE square_subscription_id = ${subscriptionId}
        RETURNING user_id, status
      `;
      if (rows[0]) {
        const memberActive = rows[0].status === "active";
        await sql`UPDATE profiles SET is_member = ${memberActive}, membership_expires_at = ${typeof subscription?.charged_through_date === "string" ? subscription.charged_through_date : null} WHERE id = ${rows[0].user_id}`;
      }
    }

    const payment = event.data?.object?.payment;
    const squareOrderId = typeof payment?.order_id === "string" ? payment.order_id : null;
    const squarePaymentId = typeof payment?.id === "string" ? payment.id : null;
    const paymentStatus = typeof payment?.status === "string" ? payment.status : null;
    if ((event.type === "payment.created" || event.type === "payment.updated") && squareOrderId && paymentStatus) {
      const localPaymentStatus = paymentStatus === "COMPLETED"
        ? "paid"
        : paymentStatus === "FAILED" || paymentStatus === "CANCELED"
          ? "failed"
          : "pending";
      await sql`
        UPDATE orders SET
          payment_status = ${localPaymentStatus},
          square_payment_id = COALESCE(${squarePaymentId}, square_payment_id),
          paid_at = CASE WHEN ${localPaymentStatus} = 'paid' THEN COALESCE(paid_at, now()) ELSE paid_at END
        WHERE square_order_id = ${squareOrderId}
      `;

      if (localPaymentStatus === "paid") {
        const paidOrders = await sql`
          SELECT
            order_group_id,
            MAX(customer_name) AS customer_name,
            MAX(customer_email) AS customer_email,
            MAX(delivery_type::text) AS delivery_type,
            SUM(total_amount) AS total_amount,
            MAX(confirmation_email_sent_at) AS confirmation_email_sent_at
          FROM orders
          WHERE square_order_id = ${squareOrderId}
          GROUP BY order_group_id
          LIMIT 1
        `;
        const paidOrder = paidOrders[0];
        if (paidOrder && !paidOrder.confirmation_email_sent_at) {
          await sendPaidOrderEmails({
            orderReference: String(paidOrder.order_group_id),
            customerName: String(paidOrder.customer_name),
            customerEmail: String(paidOrder.customer_email),
            total: Number(paidOrder.total_amount),
            deliveryType: paidOrder.delivery_type ? String(paidOrder.delivery_type) : null,
            receiptUrl: typeof payment?.receipt_url === "string" ? payment.receipt_url : null,
          });
          await sql`UPDATE orders SET confirmation_email_sent_at = now() WHERE square_order_id = ${squareOrderId}`;
        }
      }
    }

    return NextResponse.json({ received: true, eventType: event.type || null, eventId: event.event_id || null });
  } catch (error) {
    console.error("Square webhook processing failed", error);
    return NextResponse.json({ error: "Webhook received but could not be processed." }, { status: 500 });
  }
}
