import type { MarketId } from "../ordering/markets";
import { MARKETS } from "../ordering/markets";
import { zonedDateKey } from "../ordering/time";
import { getRestJsonHeaders, getRestUrl, isSupabaseConfigured } from "./supabase";

export type SameDayStatus = {
  enabled: boolean;
  /** False if we could not read staff settings — checkout must not charge. */
  known: boolean;
};

/**
 * Per-city same-day kill switch. Falls back to legacy `app_settings.orders_enabled`
 * until `market_settings` is applied. Fail-closed at pay time via {@link assertCheckoutAllowed}.
 */
export async function fetchSameDayOrdersStatus(marketId: MarketId): Promise<SameDayStatus> {
  if (!isSupabaseConfigured()) return { enabled: true, known: false };
  try {
    const marketRes = await fetch(
      `${getRestUrl("market_settings")}?select=same_day_orders_enabled&market_id=eq.${encodeURIComponent(marketId)}`,
      { headers: getRestJsonHeaders() },
    );
    if (marketRes.ok) {
      const rows = (await marketRes.json()) as Array<{ same_day_orders_enabled?: boolean }>;
      if (Array.isArray(rows) && rows[0]) {
        return { enabled: rows[0].same_day_orders_enabled !== false, known: true };
      }
    }
    const legacy = await fetch(`${getRestUrl("app_settings")}?select=orders_enabled&id=eq.1`, {
      headers: getRestJsonHeaders(),
    });
    if (!legacy.ok) return { enabled: true, known: false };
    const legacyRows = (await legacy.json()) as Array<{ orders_enabled?: boolean }>;
    if (!Array.isArray(legacyRows) || !legacyRows[0]) return { enabled: true, known: false };
    return { enabled: legacyRows[0].orders_enabled !== false, known: true };
  } catch {
    return { enabled: true, known: false };
  }
}

export async function fetchSameDayOrdersEnabled(marketId: MarketId): Promise<boolean> {
  const status = await fetchSameDayOrdersStatus(marketId);
  return status.known ? status.enabled : true;
}

export async function assertCheckoutAllowed(marketId: MarketId, serviceDateKey: string): Promise<void> {
  const status = await fetchSameDayOrdersStatus(marketId);
  if (!status.known) {
    throw new Error("Couldn’t confirm ordering is open. Try again in a moment — you have not been charged.");
  }
  if (status.enabled) return;

  const today = zonedDateKey(new Date(), MARKETS[marketId].timezone);
  const isToday = serviceDateKey.trim().slice(0, 10) === today;
  /** Legacy global pause (`app_settings.orders_enabled`) blocks every insert, including advance dates. */
  if (!isToday) {
    const marketRes = await fetch(
      `${getRestUrl("market_settings")}?select=market_id&market_id=eq.${encodeURIComponent(marketId)}`,
      { headers: getRestJsonHeaders() },
    );
    const rows = marketRes.ok ? ((await marketRes.json()) as unknown[]) : [];
    const perMarket = Array.isArray(rows) && rows.length > 0;
    if (perMarket) return;
    throw new Error("Ordering is paused right now. You have not been charged.");
  }
  throw new Error("Same-day delivery is paused right now. Pick a future date — you have not been charged.");
}
