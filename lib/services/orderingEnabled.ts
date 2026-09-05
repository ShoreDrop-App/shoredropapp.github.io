import { getRestJsonHeaders, getRestUrl, isSupabaseConfigured } from "./supabase";

export type OrderingStatus = {
  enabled: boolean;
  /** False if staff settings could not be read. */
  known: boolean;
};

/** Live app kill switch (`app_settings.orders_enabled`). */
export async function fetchOrderingStatus(): Promise<OrderingStatus> {
  if (!isSupabaseConfigured()) return { enabled: true, known: false };
  try {
    const res = await fetch(`${getRestUrl("app_settings")}?select=orders_enabled&id=eq.1`, {
      headers: getRestJsonHeaders(),
    });
    if (!res.ok) return { enabled: true, known: false };
    const rows = (await res.json()) as Array<{ orders_enabled?: boolean }>;
    if (!Array.isArray(rows) || !rows[0]) return { enabled: true, known: false };
    return { enabled: rows[0].orders_enabled !== false, known: true };
  } catch {
    return { enabled: true, known: false };
  }
}

export async function assertOrderingOpen(): Promise<void> {
  const status = await fetchOrderingStatus();
  if (!status.known) {
    throw new Error("Couldn’t confirm ordering is open. Try again in a moment.");
  }
  if (!status.enabled) {
    throw new Error("Ordering is paused right now.");
  }
}
