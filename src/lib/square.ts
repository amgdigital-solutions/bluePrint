const SQUARE_API_VERSION = "2026-08-19";

const REQUIRED_CHECKOUT_SCOPES = ["ORDERS_WRITE", "PAYMENTS_WRITE"] as const;

type PaymentLinkResult = {
  id: string;
  orderId: string;
  url: string;
};

function normalizeSquareValue(value?: string) {
  const trimmed = value?.trim() ?? "";
  const unquoted = trimmed.replace(/^(["'])(.*)\1$/, "$2").trim();
  return unquoted.replace(/^Bearer\s+/i, "").trim();
}

function squareEnvironment() {
  return normalizeSquareValue(process.env.SQUARE_ENVIRONMENT).toLowerCase() === "production"
    ? "production"
    : "sandbox";
}

function squareBaseUrl() {
  return squareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function squareAccessToken() {
  return normalizeSquareValue(process.env.SQUARE_ACCESS_TOKEN);
}

export type SquareHealth = {
  ok: boolean;
  environment: "production" | "sandbox";
  statusCode: number;
  clientId: string | null;
  merchantId: string | null;
  scopes: string[];
  hasRequiredCheckoutScopes: boolean;
  tokenConfigured: boolean;
};

export async function getSquareHealth(): Promise<SquareHealth> {
  const accessToken = squareAccessToken();
  const environment = squareEnvironment();

  if (!accessToken) {
    return {
      ok: false,
      environment,
      statusCode: 0,
      clientId: null,
      merchantId: null,
      scopes: [],
      hasRequiredCheckoutScopes: false,
      tokenConfigured: false,
    };
  }

  const response = await fetch(`${squareBaseUrl()}/oauth2/token/status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": SQUARE_API_VERSION,
    },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as {
    client_id?: string;
    merchant_id?: string;
    scopes?: string[];
  };
  const scopes = Array.isArray(result.scopes) ? result.scopes : [];

  return {
    ok: response.ok,
    environment,
    statusCode: response.status,
    clientId: result.client_id ?? null,
    merchantId: result.merchant_id ?? null,
    scopes,
    hasRequiredCheckoutScopes: REQUIRED_CHECKOUT_SCOPES.every((scope) => scopes.includes(scope)),
    tokenConfigured: true,
  };
}

export async function createOrderPaymentLink(input: {
  orderReference: string;
  amountCents: number;
  buyerEmail: string;
  redirectUrl: string;
}): Promise<PaymentLinkResult> {
  const accessToken = squareAccessToken();
  const locationId = normalizeSquareValue(process.env.SQUARE_LOCATION_ID);
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
    if (response.status === 401) {
      const health = await getSquareHealth().catch(() => null);
      console.error("Square checkout authorization failed", health ?? {
        environment: squareEnvironment(),
        statusCode: 0,
        tokenConfigured: Boolean(accessToken),
      });
    }
    const detail = result.errors?.map((error) => error.detail || error.code).filter(Boolean).join("; ");
    throw new Error(detail || "Square could not create a checkout link.");
  }

  return {
    id: result.payment_link.id,
    orderId: result.payment_link.order_id,
    url: result.payment_link.url,
  };
}
