import { addHours } from "date-fns";
import { fromZonedTime } from "date-fns-tz/fromZonedTime";
import { formatInTimeZone } from "date-fns-tz/formatInTimeZone";

const DEFAULT_TZ = "America/New_York";

export function zonedDateKey(d: Date, timeZone = DEFAULT_TZ): string {
  return d.toLocaleDateString("en-CA", { timeZone });
}

/** Local-calendar Date for “today” in `timeZone` (noon, so DST does not shift the day). */
export function zonedCalendarDate(now = new Date(), timeZone = DEFAULT_TZ): Date {
  const [y, m, d] = zonedDateKey(now, timeZone).split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function zonedMinutesSinceMidnight(d: Date, timeZone = DEFAULT_TZ): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(d);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return hour * 60 + minute;
}

export function easternDateKey(d: Date): string {
  return zonedDateKey(d, DEFAULT_TZ);
}

export function easternMinutesSinceMidnight(d: Date): number {
  return zonedMinutesSinceMidnight(d, DEFAULT_TZ);
}

/** Food ordering window: 10:00 AM ≤ t < 4:00 PM Eastern. */
export function isFoodDrinkOrderWindowOpen(now = new Date()): boolean {
  const t = easternMinutesSinceMidnight(now);
  return t >= 10 * 60 && t < 16 * 60;
}

/** Same-day gear cutoff: after 4 PM Eastern, today is disabled. */
export function isSameDayGearCutoffPassed(now = new Date(), timeZone = DEFAULT_TZ): boolean {
  return zonedMinutesSinceMidnight(now, timeZone) >= 16 * 60;
}

export function parseBeachStartClock(label: string): { hour: number; minute: number } | null {
  const m = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { hour: h, minute };
}

export function beachWallStartToInstant(
  serviceDate: Date,
  startTimeLabel: string,
  timeZone = DEFAULT_TZ,
): Date | null {
  const clock = parseBeachStartClock(startTimeLabel);
  if (!clock) return null;
  return fromZonedTime(
    new Date(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate(), clock.hour, clock.minute, 0, 0),
    timeZone,
  );
}

export function formatBookingEndTime(
  serviceDate: Date,
  startTimeLabel: string,
  durationHours: number,
  timeZone = DEFAULT_TZ,
): string {
  const start = beachWallStartToInstant(serviceDate, startTimeLabel, timeZone);
  if (!start) return "";
  try {
    return formatInTimeZone(addHours(start, durationHours), timeZone, "h:mm a");
  } catch {
    return "";
  }
}

/** Gear pickup cutoff 7:00 PM Eastern — rentals ending after this are not offered (matches Cap app). */
export const GEAR_PICKUP_CUTOFF_HOUR_EASTERN = 19;

export function rentalEndsAfterPickupCutoff(
  serviceDate: Date,
  startTimeLabel: string,
  durationHours: number,
  cutoffHour = GEAR_PICKUP_CUTOFF_HOUR_EASTERN,
  timeZone = DEFAULT_TZ,
): boolean {
  try {
    const start = beachWallStartToInstant(serviceDate, startTimeLabel, timeZone);
    if (!start) return false;
    const end = addHours(start, durationHours);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(end);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    return h * 60 + m > cutoffHour * 60;
  } catch {
    return false;
  }
}

export function roundUsd2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/** Matches promo payload from Stripe (`create-payment-intent` validateOnly). */
export type StripePromoLike =
  | null
  | {
      percentOff?: number;
      amountOffCents?: number;
      description?: string;
    };

/**
 * Apply promo to merchandise + delivery only (not tip / on-demand surcharge).
 * Splits savings across subtotal vs delivery so order columns still balance.
 */
export function computePromoAgainstMerchandisePlusDelivery(params: {
  merchandiseUsd: number;
  deliveryFeeUsd: number;
  promo: StripePromoLike;
}): {
  promoBaseUsd: number;
  discountUsd: number;
  netMerchandiseUsd: number;
  netDeliveryFeeUsd: number;
} {
  const merchandiseUsd = Math.max(0, roundUsd2(params.merchandiseUsd));
  const deliveryFeeUsd = Math.max(0, roundUsd2(params.deliveryFeeUsd));
  const promoBaseUsd = roundUsd2(merchandiseUsd + deliveryFeeUsd);
  const { promo } = params;

  if (!promo) {
    return {
      promoBaseUsd,
      discountUsd: 0,
      netMerchandiseUsd: merchandiseUsd,
      netDeliveryFeeUsd: deliveryFeeUsd,
    };
  }

  let discountUsd = 0;
  if (typeof promo.percentOff === "number" && promo.percentOff > 0) {
    discountUsd = roundUsd2((promoBaseUsd * promo.percentOff) / 100);
  } else if (typeof promo.amountOffCents === "number" && promo.amountOffCents > 0) {
    discountUsd = roundUsd2(Math.min(promoBaseUsd, promo.amountOffCents / 100));
  }

  discountUsd = Math.min(discountUsd, promoBaseUsd);

  if (discountUsd <= 0 || promoBaseUsd <= 0) {
    return {
      promoBaseUsd,
      discountUsd: 0,
      netMerchandiseUsd: merchandiseUsd,
      netDeliveryFeeUsd: deliveryFeeUsd,
    };
  }

  const discMerch = merchandiseUsd > 0 ? roundUsd2(discountUsd * (merchandiseUsd / promoBaseUsd)) : 0;
  const discDeliv = roundUsd2(discountUsd - discMerch);

  let netMerchandiseUsd = Math.max(0, roundUsd2(merchandiseUsd - discMerch));
  let netDeliveryFeeUsd = Math.max(0, roundUsd2(deliveryFeeUsd - discDeliv));

  const sumNet = roundUsd2(netMerchandiseUsd + netDeliveryFeeUsd);
  const expectedNetBase = roundUsd2(promoBaseUsd - discountUsd);
  if (sumNet !== expectedNetBase) {
    netDeliveryFeeUsd = roundUsd2(netDeliveryFeeUsd + (expectedNetBase - sumNet));
    if (netDeliveryFeeUsd < 0) {
      netMerchandiseUsd = roundUsd2(netMerchandiseUsd + netDeliveryFeeUsd);
      netDeliveryFeeUsd = 0;
      netMerchandiseUsd = Math.max(0, netMerchandiseUsd);
    }
  }

  return { promoBaseUsd, discountUsd, netMerchandiseUsd, netDeliveryFeeUsd };
}

export function computeCheckoutTotals(input: {
  merchandiseUsd: number;
  deliveryFeeUsd: number;
  onDemandSurchargeUsd: number;
  tipUsd: number;
  promo?: StripePromoLike;
}) {
  const promoPart = computePromoAgainstMerchandisePlusDelivery({
    merchandiseUsd: input.merchandiseUsd,
    deliveryFeeUsd: input.deliveryFeeUsd,
    promo: input.promo ?? null,
  });
  const orderTotalUsd = roundUsd2(
    promoPart.netMerchandiseUsd +
      promoPart.netDeliveryFeeUsd +
      roundUsd2(input.onDemandSurchargeUsd) +
      roundUsd2(input.tipUsd),
  );
  return {
    ...promoPart,
    orderTotalUsd,
    grossMerchandiseUsd: roundUsd2(input.merchandiseUsd),
    grossDeliveryFeeUsd: roundUsd2(input.deliveryFeeUsd),
  };
}

/** Calendar day equality in Eastern. */
export function isSameEasternDay(a: Date, b: Date): boolean {
  return easternDateKey(a) === easternDateKey(b);
}

export function isSameZonedDay(a: Date, b: Date, timeZone: string): boolean {
  return zonedDateKey(a, timeZone) === zonedDateKey(b, timeZone);
}
