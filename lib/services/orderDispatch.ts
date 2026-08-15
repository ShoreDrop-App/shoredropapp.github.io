import { easternDateKey } from "../ordering/time";
import {
  getFunctionHeaders,
  getFunctionUrl,
  getRestInsertMinimalHeaders,
  getRestUrl,
} from "./supabase";

export type OrderLineItem = {
  id: string;
  type: "package" | "custom" | "food" | "addon";
  name: string;
  price: number;
  quantity: number;
  catalogPackageId?: string;
  /** What’s included in a package (or custom setup summary lines). */
  includes?: string[];
  /** Extra gear / games attached to a package line. */
  addOns?: Array<{ name: string; quantity: number; price?: number; catalogAddonId?: string }>;
  foodRestaurantId?: string;
  foodRestaurantName?: string;
  metadata?: Record<string, unknown>;
};

export async function placeOrderAndDispatch(input: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  /** Supabase Auth user id — required so orders sync to the customer app. */
  customerAuthId?: string;
  stripePaymentIntentId?: string;
  locationDisplayName: string;
  locationFullAddress: string;
  serviceDate: Date;
  startTime: string;
  endTime: string;
  crewNotes?: string;
  tipAmount: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  items: OrderLineItem[];
}): Promise<{ orderId: string; trackingToken: string | null; dispatchNotified: boolean }> {
  const orderId = crypto.randomUUID();

  const orderPayload = {
    id: orderId,
    customer_name: input.customerName || "Guest",
    customer_phone: input.customerPhone?.trim() || null,
    phone_verified_at: null,
    customer_email: input.customerEmail?.trim() || null,
    customer_auth_id: input.customerAuthId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    payment_status: input.stripePaymentIntentId ? "paid" : "pending",
    location_display_name: input.locationDisplayName,
    location_full_address: input.locationFullAddress,
    service_date: easternDateKey(input.serviceDate),
    start_time: input.startTime,
    end_time: input.endTime,
    crew_notes: input.crewNotes || null,
    tip_amount: input.tipAmount,
    subtotal: input.subtotal,
    service_fee: input.serviceFee,
    total_amount: input.totalAmount,
    status: "confirmed",
  };

  const ordersResponse = await fetch(getRestUrl("orders"), {
    method: "POST",
    headers: getRestInsertMinimalHeaders(),
    body: JSON.stringify(orderPayload),
  });

  if (!ordersResponse.ok) {
    let detail = "";
    try {
      const errBody = await ordersResponse.clone().json();
      detail = ` ${[errBody?.message, errBody?.hint].filter(Boolean).join(" — ")}`;
    } catch {
      /* ignore */
    }
    throw new Error(`Failed to create order (${ordersResponse.status}).${detail}`.trim());
  }

  const itemPayload = input.items.map((item) => ({
    order_id: orderId,
    item_id: item.id,
    item_type: item.type,
    item_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    metadata: {
      catalogPackageId: item.catalogPackageId ?? null,
      foodRestaurantId: item.foodRestaurantId ?? null,
      foodRestaurantName: item.foodRestaurantName ?? null,
      includes: item.includes ?? [],
      addOns: item.addOns ?? [],
      ...(item.metadata ?? {}),
    },
  }));

  const itemsResponse = await fetch(getRestUrl("order_items"), {
    method: "POST",
    headers: getRestInsertMinimalHeaders(),
    body: JSON.stringify(itemPayload),
  });

  if (!itemsResponse.ok) {
    let detail = "";
    try {
      const errBody = (await itemsResponse.clone().json()) as { message?: string; hint?: string };
      detail = [errBody?.message, errBody?.hint].filter(Boolean).join(" — ");
    } catch {
      /* ignore */
    }
    await fetch(getRestUrl(`orders?id=eq.${orderId}`), {
      method: "DELETE",
      headers: getRestInsertMinimalHeaders(),
    }).catch(() => undefined);
    if (/GEAR_POOL_SOLD_OUT/i.test(detail)) {
      throw new Error("That gear just sold out for this date. Pick fewer items or another day.");
    }
    throw new Error(detail || `Failed to save order items (${itemsResponse.status}).`);
  }

  let trackingToken: string | null = null;
  if (input.stripePaymentIntentId) {
    try {
      const res = await fetch(getFunctionUrl("guest-order-tracking"), {
        method: "POST",
        headers: getFunctionHeaders(),
        body: JSON.stringify({ orderId, paymentIntentId: input.stripePaymentIntentId }),
      });
      const body = (await res.json().catch(() => ({}))) as { trackingToken?: string };
      trackingToken = body.trackingToken ?? null;
    } catch {
      /* soft */
    }
  }

  let dispatchNotified = false;
  try {
    const res = await fetch(getFunctionUrl("dispatch-order"), {
      method: "POST",
      headers: getFunctionHeaders(),
      body: JSON.stringify({ orderId }),
    });
    dispatchNotified = res.ok;
  } catch {
    /* soft */
  }

  return { orderId, trackingToken, dispatchNotified };
}
