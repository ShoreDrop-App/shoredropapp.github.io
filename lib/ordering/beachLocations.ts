export interface BeachStreetOption {
  streetNum: number;
  streetName: string;
  displayName: string;
  fullAddress: string;
}

const getStreetSuffix = (num: number): string => {
  if (num === 42 || num === 52 || num === 62 || num === 72 || num === 82) return "nd";
  if (num === 43 || num === 53 || num === 63 || num === 73) return "rd";
  if (num === 51 || num === 61 || num === 71 || num === 81) return "st";
  return "th";
};

export const getStreetNameFromNumber = (num: number): string => `${num}${getStreetSuffix(num)} St`;

export const SERVICE_AREA_START_STREET = 42;
export const SERVICE_AREA_END_STREET = 86;
export const SERVICE_AREA_LABEL = "42nd–86th Street";

const EXCLUDED = new Set([57]);

const CUSTOM: Record<number, { displayName: string; fullAddress: string }> = {
  56: {
    displayName: "Wyndham 56th Street",
    fullAddress: "Wyndham 56th Street, Virginia Beach, VA",
  },
  58: {
    displayName: "Wyndham 58th Street",
    fullAddress: "Wyndham 58th Street, Virginia Beach, VA",
  },
};

function build(num: number): BeachStreetOption {
  const streetName = getStreetNameFromNumber(num);
  const custom = CUSTOM[num];
  if (custom) {
    return { streetNum: num, streetName, ...custom };
  }
  const suffix = getStreetSuffix(num);
  return {
    streetNum: num,
    streetName,
    displayName: `${num}${suffix} St Beach`,
    fullAddress: `${num}${suffix} Street, Virginia Beach, VA`,
  };
}

export const BEACH_LOCATION_OPTIONS: BeachStreetOption[] = Array.from(
  { length: SERVICE_AREA_END_STREET - SERVICE_AREA_START_STREET + 1 },
  (_, i) => SERVICE_AREA_START_STREET + i,
)
  .filter((n) => !EXCLUDED.has(n))
  .map(build);

export type DropSpot = { id: string; displayName: string; fullAddress: string };

export const PCB_DROP_SPOTS: DropSpot[] = [
  "95",
  "92",
  "89",
  "86",
  "84",
  "82",
  "81",
  "80",
  "79",
  "76B",
].map((id) => ({
  id: `access-${id}`,
  displayName: `Beach Access ${id}`,
  fullAddress: `Beach Access ${id}, Panama City Beach, FL`,
}));

export function dropSpotsForMarket(marketId: "vb" | "pcb"): DropSpot[] {
  if (marketId === "pcb") return PCB_DROP_SPOTS;
  return BEACH_LOCATION_OPTIONS.map((o) => ({
    id: o.streetName,
    displayName: o.displayName,
    fullAddress: o.fullAddress,
  }));
}

