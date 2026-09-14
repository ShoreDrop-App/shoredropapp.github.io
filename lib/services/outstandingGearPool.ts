import { emptyPool, type InventoryBucket } from "../ordering/inventory";
import { getRestJsonHeaders, getRestUrl, isSupabaseConfigured } from "./supabase";

/**
 * Gear reserved server-side for Eastern `serviceDateKey` (`YYYY-MM-DD`).
 * Same RPC as Cap iOS/Android app — keeps website + apps in one pool.
 */
export async function fetchOutstandingGearPoolCounts(
  serviceDateKey: string,
  marketId: string = "vb",
): Promise<Record<InventoryBucket, number> | null> {
  if (!isSupabaseConfigured()) return null;
  const day = serviceDateKey.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  try {
    const post = (body: Record<string, string>) =>
      fetch(getRestUrl("rpc/outstanding_gear_pool_counts"), {
        method: "POST",
        headers: getRestJsonHeaders(),
        body: JSON.stringify(body),
      });
    let res = await post({ p_service_date: day, p_market_id: marketId });
    if (!res.ok) res = await post({ p_service_date: day });
    if (!res.ok) return null;
    const payload = (await res.json()) as unknown;
    const row = Array.isArray(payload) ? payload[0] : payload;
    let inner: unknown = row;
    if (row && typeof row === "object" && "outstanding_gear_pool_counts" in (row as object)) {
      inner = (row as Record<string, unknown>).outstanding_gear_pool_counts;
    }
    if (typeof inner === "string") {
      try {
        inner = JSON.parse(inner);
      } catch {
        return null;
      }
    }
    if (!inner || typeof inner !== "object") return null;
    const out = emptyPool();
    (Object.keys(out) as InventoryBucket[]).forEach((k) => {
      const v = (inner as Record<string, unknown>)[k];
      const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseFloat(v) : NaN;
      out[k] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    });
    return out;
  } catch {
    return null;
  }
}
