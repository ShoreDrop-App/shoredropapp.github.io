import { getFunctionHeaders, getFunctionUrl, isSupabaseConfigured } from "./supabase";

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const isStripeConfigured = (): boolean =>
  Boolean(STRIPE_PUBLISHABLE_KEY.startsWith("pk_"));

export interface StripePromoResult {
  percentOff?: number;
  amountOffCents?: number;
  description: string;
}

/** Validate a Stripe promotion code without creating a payment intent. */
export async function validateStripePromoCode(promoCode: string): Promise<StripePromoResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cloud checkout requires Supabase to be configured.");
  }
  const res = await fetch(getFunctionUrl("create-payment-intent"), {
    method: "POST",
    headers: getFunctionHeaders(),
    body: JSON.stringify({ validateOnly: true, promoCode }),
  });
  const raw = await res.text();
  let payload = {} as { valid?: boolean; promo?: StripePromoResult; error?: string };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    /* ignore */
  }
  if (!res.ok || !payload.valid || !payload.promo) {
    throw new Error(payload.error || "Invalid or expired promo code.");
  }
  return payload.promo;
}

export type CreatePaymentIntentOptions = {
  marketId?: string;
  serviceDate?: string;
  idempotencyKey?: string;
};

export async function createPaymentIntentClientSecret(
  amountCents: number,
  promoCode?: string,
  options?: CreatePaymentIntentOptions,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cloud checkout requires Supabase to be configured.");
  }
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    throw new Error("Invalid payment amount.");
  }

  const res = await fetch(getFunctionUrl("create-payment-intent"), {
    method: "POST",
    headers: getFunctionHeaders(),
    body: JSON.stringify({
      amountCents,
      ...(promoCode ? { promoCode } : {}),
      ...(options?.marketId ? { marketId: options.marketId } : {}),
      ...(options?.serviceDate ? { serviceDate: options.serviceDate } : {}),
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    }),
  });

  const raw = await res.text();
  let payload = {} as { clientSecret?: string; error?: string };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    payload = { error: raw.slice(0, 280) };
  }

  if (!res.ok || !payload.clientSecret) {
    throw new Error(payload.error || `Could not start payment (HTTP ${res.status}).`);
  }
  return payload.clientSecret;
}

export async function refundPaymentIntent(paymentIntentId: string): Promise<boolean> {
  const id = paymentIntentId.trim();
  if (!id.startsWith("pi_")) return false;
  try {
    const res = await fetch(getFunctionUrl("create-payment-intent"), {
      method: "POST",
      headers: getFunctionHeaders(),
      body: JSON.stringify({ refundPaymentIntentId: id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createOrderExtensionPaymentIntent(
  amountCents: number,
  orderId: string,
  extensionHours: 1 | 2 | 3,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Extensions require Supabase to be configured.");
  }
  const res = await fetch(getFunctionUrl("create-payment-intent"), {
    method: "POST",
    headers: getFunctionHeaders(),
    body: JSON.stringify({
      amountCents,
      orderId,
      kind: "order_extension",
      extensionHours,
    }),
  });
  const raw = await res.text();
  let payload = {} as { clientSecret?: string; error?: string };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    payload = { error: raw.slice(0, 280) };
  }
  if (!res.ok || !payload.clientSecret) {
    throw new Error(payload.error || "Could not start extension payment.");
  }
  return payload.clientSecret;
}

export async function recordOrderExtension(args: {
  orderId: string;
  trackingToken: string;
  paymentIntentId: string;
}): Promise<{ endTime: string; totalAmount: number; addedAmount: number; hours: number }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Extensions require Supabase to be configured.");
  }
  const res = await fetch(getFunctionUrl("extend-order-time"), {
    method: "POST",
    headers: getFunctionHeaders(),
    body: JSON.stringify(args),
  });
  const raw = await res.text();
  let payload = {} as {
    ok?: boolean;
    endTime?: string;
    totalAmount?: number;
    addedAmount?: number;
    hours?: number;
    error?: string;
  };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    payload = { error: raw.slice(0, 280) };
  }
  if (!res.ok || !payload.ok) {
    throw new Error(payload.error || "Could not apply your extension.");
  }
  return {
    endTime: String(payload.endTime ?? ""),
    totalAmount: Number(payload.totalAmount) || 0,
    addedAmount: Number(payload.addedAmount) || 0,
    hours: Number(payload.hours) || 0,
  };
}
