const STORAGE_KEY = "shoredrop_pending_checkout_payment_v1";

export type PendingCheckoutPayment = {
  paymentIntentId: string;
  amountCents: number;
  marketId: string;
  serviceDate: string;
  fingerprint: string;
};

export function checkoutFingerprint(parts: Array<string | number>): string {
  return parts.map((p) => String(p).trim()).join("|");
}

export function readPendingCheckoutPayment(): PendingCheckoutPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckoutPayment;
    if (!parsed?.paymentIntentId?.startsWith("pi_")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingCheckoutPayment(pending: PendingCheckoutPayment) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function clearPendingCheckoutPayment() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Reuse a succeeded PaymentIntent so a failed order insert does not charge again. */
export function reusePendingPayment(args: {
  amountCents: number;
  marketId: string;
  serviceDate: string;
  fingerprint: string;
}): string | null {
  const pending = readPendingCheckoutPayment();
  if (!pending) return null;
  if (
    pending.amountCents === args.amountCents &&
    pending.marketId === args.marketId &&
    pending.serviceDate === args.serviceDate &&
    pending.fingerprint === args.fingerprint
  ) {
    return pending.paymentIntentId;
  }
  return null;
}

const IDEMPOTENCY_KEY = "shoredrop_checkout_idempotency_v1";

/** Stable Stripe idempotency key for this checkout attempt (same cart + date). */
export function checkoutIdempotencyKey(fingerprint: string): string {
  if (typeof window === "undefined") return `sdchk_${fingerprint}`.slice(0, 255);
  try {
    const raw = window.sessionStorage.getItem(IDEMPOTENCY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { fingerprint?: string; key?: string };
      if (parsed.fingerprint === fingerprint && parsed.key) return parsed.key.slice(0, 255);
    }
    const key = `sdchk_${fingerprint}_${crypto.randomUUID()}`.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 255);
    window.sessionStorage.setItem(IDEMPOTENCY_KEY, JSON.stringify({ fingerprint, key }));
    return key;
  } catch {
    return `sdchk_${fingerprint}`.slice(0, 255);
  }
}
