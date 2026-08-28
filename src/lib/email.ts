type PaidOrderEmail = {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  total: number;
  deliveryType: string | null;
  receiptUrl?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character] || character));
}

async function sendEmail(input: { to: string; subject: string; html: string; idempotencyKey: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend email is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
  });
  const result = await response.json() as { id?: string; message?: string; error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message || result.message || "Resend rejected the email.");
  return result.id || null;
}

export async function sendPaidOrderEmails(order: PaidOrderEmail) {
  const reference = escapeHtml(order.orderReference);
  const name = escapeHtml(order.customerName);
  const amount = order.total.toFixed(2);
  const fulfillment = order.deliveryType === "delivery" ? "Delivery" : "Pickup at 5001 S Dixie Hwy, West Palm Beach, FL 33405";
  const receipt = order.receiptUrl
    ? `<p><a href="${escapeHtml(order.receiptUrl)}" style="color:#1746b0">View your Square receipt</a></p>`
    : "";
  const shared = `<p><strong>Order:</strong> ${reference}<br><strong>Paid:</strong> $${amount}<br><strong>Fulfillment:</strong> ${fulfillment}</p>`;

  await sendEmail({
    to: order.customerEmail,
    subject: `Payment confirmed — ${order.orderReference}`,
    idempotencyKey: `customer-paid-${order.orderReference}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033"><h1 style="color:#1746b0">Payment confirmed</h1><p>Hello ${name},</p><p>Thank you. Your blueprint order has been received and paid successfully.</p>${shared}${receipt}<p>We will confirm production timing based on workload and order complexity.</p><p>Your uploaded files are stored privately and automatically deleted 30 days after upload.</p><p>Blueprints Club</p></div>`,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New paid order — ${order.orderReference}`,
      idempotencyKey: `admin-paid-${order.orderReference}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033"><h1>New paid blueprint order</h1><p><strong>Customer:</strong> ${name}<br><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>${shared}<p><a href="https://www.blueprintsclub.com/admin/orders" style="color:#1746b0">Open the admin order screen</a></p></div>`,
    });
  }
}
