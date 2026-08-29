type PaidOrderEmail = {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  total: number;
  deliveryType: string | null;
  receiptUrl?: string | null;
};

type QuoteRequestEmail = {
  productName: string;
  sampleName?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  details?: string | null;
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

export async function sendQuoteRequestEmails(quote: QuoteRequestEmail) {
  const name = escapeHtml(quote.customerName);
  const product = escapeHtml(quote.productName);
  const sample = escapeHtml(quote.sampleName || "No example selected");
  const details = escapeHtml(quote.details || "No additional details provided").replace(/\n/g, "<br>");
  const phone = quote.customerPhone ? `<p><strong>Phone:</strong> ${escapeHtml(quote.customerPhone)}</p>` : "";
  const shared = `<p><strong>Product:</strong> ${product}<br><strong>Selected example:</strong> ${sample}</p>${phone}<p style="white-space:normal"><strong>Project details:</strong><br>${details}</p>`;

  await sendEmail({
    to: quote.customerEmail,
    subject: `Thanks for contacting Blueprints Club — ${quote.productName}`,
    idempotencyKey: `quote-customer-${quote.customerEmail}-${quote.productName}-${quote.sampleName || "none"}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033;border:1px solid #dbe5f4;border-radius:18px;overflow:hidden"><div style="background:#17245f;padding:28px;color:#fff"><div style="font-size:22px;font-weight:700;letter-spacing:.04em">BLUEPRINTS CLUB</div><div style="color:#b9ccff;margin-top:6px">Engineering · Architectural · Landscaping</div></div><div style="padding:30px"><h1 style="color:#1746b0;margin-top:0">Thanks for your quote request</h1><p>Hello ${name},</p><p>We received your request for <strong>${product}</strong>. Our team will review the example and project information you shared, then contact you with pricing and next steps.</p>${shared}<p>We also offer member pricing on blueprint printing, convenient pickup, and delivery within our service area. You can learn more at <a href="https://www.blueprintsclub.com/membership" style="color:#1746b0">Blueprints Club membership</a>.</p><p>Thank you for choosing Blueprints Club.</p><p style="margin-bottom:0"><strong>Blueprints Club</strong><br>5001 S Dixie Hwy<br>West Palm Beach, FL 33405<br><a href="tel:+15618049110" style="color:#1746b0">+1 (561) 804-9110</a></p></div></div>`,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New quote request — ${quote.productName}`,
      idempotencyKey: `quote-admin-${quote.customerEmail}-${quote.productName}-${quote.sampleName || "none"}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h1 style="color:#1746b0">New custom product quote</h1>${shared}<p><strong>Customer:</strong> ${name}<br><strong>Email:</strong> <a href="mailto:${escapeHtml(quote.customerEmail)}">${escapeHtml(quote.customerEmail)}</a></p><p><a href="https://www.blueprintsclub.com/admin/quotes" style="display:inline-block;background:#1746b0;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Open quote requests</a></p></div>`,
    });
  }
}
