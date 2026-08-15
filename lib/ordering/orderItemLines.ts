import type { DriverItemRow } from "../services/driverPortal";

export type OrderItemDisplay = {
  /** e.g. `1× The Shady Bunch` */
  title: string;
  /** Gear inside a package, or the picks inside a custom setup. */
  details: string[];
  /** Paid extras added on top of a package. */
  addOns: string[];
  waived: boolean;
  waivedReason: string | null;
};

const cleanStrings = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
};

const addOnLabels = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) continue;
    const qtyRaw = typeof o.quantity === "number" ? o.quantity : Number(o.quantity);
    const qty = Number.isFinite(qtyRaw) ? Math.max(1, Math.floor(qtyRaw)) : 1;
    out.push(`${qty}× ${name}`);
  }
  return out;
};

/** Mirror of the Cap app's `flatStoredOrderLines` — expands package contents and add-ons. */
export function expandOrderItem(row: DriverItemRow): OrderItemDisplay {
  const md =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};

  const qty = Number.isFinite(row.quantity) ? Math.max(1, Math.floor(row.quantity)) : 1;
  const details = cleanStrings(md.includes);
  const size = typeof md.size === "string" ? md.size.trim() : "";
  if (size) details.push(size);

  return {
    title: `${qty}× ${row.item_name?.trim() || "Item"}`,
    details,
    addOns: addOnLabels(md.addOns),
    waived: row.fulfillment_status === "waived",
    waivedReason: typeof row.waived_reason === "string" ? row.waived_reason : null,
  };
}
