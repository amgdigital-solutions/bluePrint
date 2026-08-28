const SQUARE_API_VERSION = "2026-08-19";

type PaymentLinkResult = {
  id: string;
  orderId: string;
  url: string;
};

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function createOrderPaymentLink(input: {
  orderReference: string;
  amountCents: number;
  buyerEmail: string;
  redirectUrl: string;
}): Promise<PaymentLinkResult> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) throw new Error("Square checkout is not configured.");

  const response = await fetch(`${squareBaseUrl()}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_API_VERSION,
    },
    body: JSON.stringify({
      idempotency_key: `blueprints-order-${input.orderReference}`,
      description: `Blueprints Club order ${input.orderReference}`,
      quick_pay: {
        name: `Blueprint printing — ${input.orderReference}`,
        price_money: { amount: input.amountCents, currency: "USD" },
        location_id: locationId,
      },
      checkout_options: {
        redirect_url: input.redirectUrl,
        ask_for_shipping_address: false,
        allow_tipping: false,
      },
      pre_populated_data: { buyer_email: input.buyerEmail },
      payment_note: `Blueprints Club order ${input.orderReference}`,
    }),
    cache: "no-store",
  });

  const result = await response.json() as {
    payment_link?: { id?: string; order_id?: string; url?: string };
    errors?: Array<{ detail?: string; code?: string }>;
  };
  if (!response.ok || !result.payment_link?.id || !result.payment_link.order_id || !result.payment_link.url) {
    const detail = result.errors?.map((error) => error.detail || error.code).filter(Boolean).join("; ");
    throw new Error(detail || "Square could not create a checkout link.");
  }

  return {
    id: result.payment_link.id,
    orderId: result.payment_link.order_id,
    url: result.payment_link.url,
  };
}
