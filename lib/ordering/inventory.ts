import type { PackageId } from "./catalog";

/** On-hand caps — keep in sync with Cap app `config/inventory.ts`. */
export const INVENTORY_MAX = {
  chairs: 40,
  umbrellas: 6,
  smallCoolers: 5,
  largeCoolers: 13,
  beachTents: 11,
} as const;

export type InventoryBucket = keyof typeof INVENTORY_MAX;

export const INVENTORY_BUCKET_LABEL: Record<InventoryBucket, string> = {
  chairs: "Beach chairs",
  umbrellas: "Umbrellas",
  smallCoolers: "Small coolers",
  largeCoolers: "Large coolers",
  beachTents: "Beach tents",
};

export const PACKAGE_STOCK_USE: Record<PackageId, Partial<Record<InventoryBucket, number>>> = {
  "chill-pill": { chairs: 1, umbrellas: 1, smallCoolers: 1 },
  "sandy-duo": { chairs: 2, umbrellas: 1, smallCoolers: 1 },
  "shady-bunch": { chairs: 4, beachTents: 1, largeCoolers: 1 },
  "mega-drop": { chairs: 8, beachTents: 2, largeCoolers: 2 },
};

const CUSTOM_SKU_BUCKETS: Record<string, Partial<Record<InventoryBucket, number>>> = {
  "beach-chair": { chairs: 1 },
  umbrella: { umbrellas: 1 },
  "small-cooler": { smallCoolers: 1 },
  "large-cooler": { largeCoolers: 1 },
  "beach-tent": { beachTents: 1 },
};

export function emptyPool(): Record<InventoryBucket, number> {
  return {
    chairs: 0,
    umbrellas: 0,
    smallCoolers: 0,
    largeCoolers: 0,
    beachTents: 0,
  };
}

export function remainingPool(
  serverOutstanding: Record<InventoryBucket, number> | null,
): Record<InventoryBucket, number> {
  const out = emptyPool();
  (Object.keys(INVENTORY_MAX) as InventoryBucket[]).forEach((k) => {
    const used = serverOutstanding?.[k] ?? 0;
    out[k] = Math.max(0, INVENTORY_MAX[k] - used);
  });
  return out;
}

export function canSellPackage(
  packageId: PackageId,
  serverOutstanding: Record<InventoryBucket, number> | null,
): boolean {
  if (!serverOutstanding) return false;
  const rem = remainingPool(serverOutstanding);
  const need = PACKAGE_STOCK_USE[packageId] ?? {};
  return (Object.keys(need) as InventoryBucket[]).every((k) => (need[k] ?? 0) <= rem[k]);
}

export function canSellCustomQty(
  qty: Record<string, number>,
  serverOutstanding: Record<InventoryBucket, number> | null,
): boolean {
  if (!serverOutstanding) return false;
  const rem = remainingPool(serverOutstanding);
  const need = emptyPool();
  for (const [sku, q] of Object.entries(qty)) {
    if (q <= 0) continue;
    const use = CUSTOM_SKU_BUCKETS[sku];
    if (!use) continue;
    for (const k of Object.keys(use) as InventoryBucket[]) {
      need[k] += (use[k] ?? 0) * q;
    }
  }
  return (Object.keys(need) as InventoryBucket[]).every((k) => need[k] <= rem[k]);
}

/** How many more of this à-la-carte SKU the day can still take. */
export function remainingCustomUnits(
  sku: string,
  serverOutstanding: Record<InventoryBucket, number> | null,
): number {
  if (!serverOutstanding) return 0;
  const use = CUSTOM_SKU_BUCKETS[sku];
  if (!use) return Number.POSITIVE_INFINITY;
  const rem = remainingPool(serverOutstanding);
  return Math.min(
    ...(Object.keys(use) as InventoryBucket[]).map((k) =>
      Math.floor(rem[k] / Math.max(1, use[k] ?? 1)),
    ),
  );
}
