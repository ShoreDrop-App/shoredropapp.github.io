import type { SupabaseClient } from "@supabase/supabase-js";
import { getFunctionUrl, getUserFunctionHeaders } from "./supabase";
import type { InventoryBucket } from "../ordering/inventory";

/** Read-only subset of the Cap app's `driver-portal` client — the web admin never mutates orders. */

export type DriverOrderRow = {
  id: string;
  status: string;
  customer_name: string;
  customer_phone?: string | null;
  location_display_name: string;
  location_full_address: string;
  service_date: string;
  start_time: string;
  end_time: string;
  crew_notes: string | null;
  guest_pickup_window?: string | null;
  setup_photo_url?: string | null;
  total_amount: number;
  created_at: string;
  updated_at?: string | null;
  food_staff_eta?: string | null;
  driver_claim_user_id: string | null;
  driver_claimed_at: string | null;
  cancellation_reason?: string | null;
};

export type DriverItemRow = {
  order_id: string;
  id?: string;
  item_id?: string;
  item_type?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  metadata?: Record<string, unknown> | null;
  fulfillment_status?: "pending" | "waived" | "delivered";
  waived_reason?: string | null;
};

export type DriverListResponse = {
  orders: DriverOrderRow[];
  itemsByOrder: Record<string, DriverItemRow[]>;
};

const callDriverPortal = async <T>(
  supabase: SupabaseClient,
  label: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const jwt = data.session?.access_token;
  if (!jwt?.trim()) throw new Error("Staff session expired — sign in again.");

  const res = await fetch(getFunctionUrl("driver-portal"), {
    method: "POST",
    headers: getUserFunctionHeaders(jwt),
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  let payload: Record<string, unknown> = {};
  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }
  const errMsg = typeof payload.error === "string" ? payload.error : null;
  if (!res.ok) {
    throw new Error(errMsg || `${label}: HTTP ${res.status}`);
  }
  if (errMsg) throw new Error(errMsg);
  return payload as T;
};

export const driverListOrders = async (supabase: SupabaseClient): Promise<DriverListResponse> => {
  const data = await callDriverPortal<DriverListResponse>(supabase, "driver-portal(list)", {
    action: "list",
  });
  if (!Array.isArray(data.orders)) throw new Error("driver-portal(list): malformed response.");
  return { orders: data.orders, itemsByOrder: data.itemsByOrder ?? {} };
};

export const driverGetGearHolds = async (
  supabase: SupabaseClient,
  serviceDate: string,
): Promise<Record<InventoryBucket, number>> => {
  const data = await callDriverPortal<{ held?: Record<string, number> }>(
    supabase,
    "driver-portal(gear-holds)",
    { action: "getGearHolds", serviceDate },
  );
  const held: Record<InventoryBucket, number> = {
    chairs: 0,
    umbrellas: 0,
    smallCoolers: 0,
    largeCoolers: 0,
    beachTents: 0,
  };
  for (const k of Object.keys(held) as InventoryBucket[]) {
    const n = data.held?.[k];
    held[k] = typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  return held;
};
