import type { OrderStatus } from "../services/orderTracker";

const STORAGE_KEY = "shoredrop_web_orders_v1";

export type SavedWebOrder = {
  id: string;
  trackingToken: string;
  title: string;
  /** Expanded lines: package name, includes, add-ons, food rows. */
  detailLines?: string[];
  locationLabel?: string;
  serviceDateLabel?: string;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  createdAt: string;
  foodOnly: boolean;
};

export type TrackerStep = {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
};

const GEAR_STEPS = [
  { id: "confirmed", label: "Ordered" },
  { id: "en-route", label: "On the way" },
  { id: "setting-up", label: "Setting up" },
  { id: "ready", label: "Setup done" },
] as const;

const FOOD_STEPS = [
  { id: "confirmed", label: "Order received" },
  { id: "setting-up", label: "Being prepared" },
  { id: "en-route", label: "On the way" },
  { id: "ready", label: "Delivered" },
] as const;

const PICKUP_STEPS = [
  { id: "pickup-requested", label: "Pickup req." },
  { id: "pickup-scheduled", label: "Scheduled" },
  { id: "picked-up", label: "Picked up" },
] as const;

export function readSavedWebOrders(): SavedWebOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedWebOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberWebOrder(order: SavedWebOrder): void {
  if (typeof window === "undefined") return;
  const prev = readSavedWebOrders().filter((o) => o.id !== order.id);
  const next = [order, ...prev].slice(0, 40);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Clear browser-cached orders (call on sign-out so another account / guest can't see them). */
export function clearSavedWebOrders(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isPastStatus(status: OrderStatus): boolean {
  return status === "completed" || status === "picked-up" || status === "cancelled";
}

export function getStatusSteps(status: OrderStatus, foodOnly: boolean): TrackerStep[] {
  if (foodOnly) {
    let highlight: number | "all_done" = 0;
    if (status === "confirmed") highlight = 0;
    else if (status === "setting-up") highlight = 1;
    else if (status === "en-route") highlight = 2;
    else if (status === "ready" || status === "completed" || status === "picked-up") highlight = "all_done";
    return FOOD_STEPS.map((s, i) => ({
      ...s,
      completed: highlight === "all_done" ? true : i < highlight,
      current: highlight === "all_done" ? false : i === highlight,
    }));
  }

  const postPickup = ["pickup-requested", "pickup-scheduled", "picked-up", "completed"];
  let coreHighlight: number | "all_done";
  if (postPickup.includes(status) || status === "ready") {
    coreHighlight = "all_done";
  } else {
    const map: Partial<Record<OrderStatus, number>> = {
      confirmed: 0,
      "en-route": 1,
      "setting-up": 2,
    };
    coreHighlight = map[status] ?? 0;
  }

  const core = GEAR_STEPS.map((s, i) => ({
    ...s,
    completed: coreHighlight === "all_done" ? true : i < (coreHighlight as number),
    current: coreHighlight === "all_done" ? false : i === coreHighlight,
  }));

  if (!postPickup.includes(status) && status !== "ready") return [...core];

  let pickupHighlight = 0;
  if (status === "pickup-requested") pickupHighlight = 0;
  else if (status === "pickup-scheduled") pickupHighlight = 1;
  else if (status === "picked-up" || status === "completed") pickupHighlight = 2;

  const pickup = PICKUP_STEPS.map((s, i) => ({
    ...s,
    completed: i < pickupHighlight || status === "picked-up" || status === "completed",
    current: status !== "picked-up" && status !== "completed" && i === pickupHighlight,
  }));

  return [...core, ...pickup];
}

export function crewLabel(claimed: boolean): string {
  return claimed ? "Your beach crew" : "Waiting for delivery";
}
