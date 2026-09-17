import { getRestJsonHeaders, getRestUrl, isSupabaseConfigured } from "./supabase";

export type FoodOrderingStatus = {
  /** Customer-facing: food can be ordered right now (staff not forced off). */
  enabled: boolean;
  /** False if staff settings could not be read — checkout must not charge. */
  known: boolean;
};

/**
 * Staff food kill switch from the app (`food_staff_override` / `food_ordering_enabled`).
 * Fail-closed at pay time via {@link assertFoodOrderingOpen}.
 */
export async function fetchFoodOrderingStatus(): Promise<FoodOrderingStatus> {
  if (!isSupabaseConfigured()) return { enabled: true, known: false };
  try {
    const res = await fetch(
      `${getRestUrl("app_settings")}?select=food_staff_override,food_ordering_enabled&id=eq.1`,
      { headers: getRestJsonHeaders() },
    );
    if (!res.ok) return { enabled: true, known: false };
    const rows = (await res.json()) as Array<{
      food_staff_override?: string | null;
      food_ordering_enabled?: boolean | null;
    }>;
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return { enabled: true, known: false };
    if (row.food_staff_override === "off" || row.food_ordering_enabled === false) {
      return { enabled: false, known: true };
    }
    return { enabled: true, known: true };
  } catch {
    return { enabled: true, known: false };
  }
}

export async function assertFoodOrderingOpen(): Promise<void> {
  const status = await fetchFoodOrderingStatus();
  if (!status.known) {
    throw new Error("Couldn’t confirm food ordering is open. Try again in a moment — you have not been charged.");
  }
  if (!status.enabled) {
    throw new Error("Food ordering is paused right now. You have not been charged.");
  }
}
