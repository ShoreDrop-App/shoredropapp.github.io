export type MarketId = "vb" | "pcb";

export const MARKET_STORAGE_KEY = "shoredrop_web_market_v1";

export const MARKETS: Record<
  MarketId,
  {
    id: MarketId;
    name: string;
    shortName: string;
    regionLabel: string;
    timezone: string;
    clockZoneLabel: string;
    serviceAreaLabel: string;
    foodEnabled: boolean;
    inventory: {
      chairs: number;
      umbrellas: number;
      smallCoolers: number;
      largeCoolers: number;
      beachTents: number;
    };
  }
> = {
  vb: {
    id: "vb",
    name: "Virginia Beach",
    shortName: "VA Beach",
    regionLabel: "Virginia Beach, VA",
    timezone: "America/New_York",
    clockZoneLabel: "Eastern",
    serviceAreaLabel: "42nd–86th Street",
    foodEnabled: true,
    inventory: {
      chairs: 40,
      umbrellas: 6,
      smallCoolers: 5,
      largeCoolers: 13,
      beachTents: 11,
    },
  },
  pcb: {
    id: "pcb",
    name: "Panama City Beach",
    shortName: "PCB",
    regionLabel: "Panama City Beach, FL",
    timezone: "America/Chicago",
    clockZoneLabel: "Central",
    serviceAreaLabel: "Beach Access 76B–95",
    foodEnabled: false,
    inventory: {
      chairs: 30,
      umbrellas: 5,
      smallCoolers: 4,
      largeCoolers: 6,
      beachTents: 8,
    },
  },
};

export const PCB_ACCESS_IDS = ["95", "92", "89", "86", "84", "82", "81", "80", "79", "76B"] as const;

export function isMarketId(v: unknown): v is MarketId {
  return v === "vb" || v === "pcb";
}

export function readStoredMarket(): MarketId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MARKET_STORAGE_KEY);
    return isMarketId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function persistMarket(id: MarketId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKET_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
