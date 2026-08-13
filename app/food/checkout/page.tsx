"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startOfDay } from "date-fns";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Label } from "../../../components/label";
import SiteNav from "../../../components/SiteNav";
import { cn } from "../../../lib/utils";
import {
  FOOD_ASAP_ETA_LABEL,
  FOOD_DELIVERY_START_TIMES,
  FOOD_ONLY_WINDOW_HOURS,
  FOOD_SCHEDULE_LABEL,
  FOOD_TIP_DEFAULT,
  FOOD_TIP_PRESETS,
  getFoodRestaurant,
} from "../../../lib/ordering/catalog";
import { BEACH_LOCATION_OPTIONS } from "../../../lib/ordering/beachLocations";
import {
  computeCheckoutTotals,
  easternMinutesSinceMidnight,
  formatBookingEndTime,
  isFoodDrinkOrderWindowOpen,
  parseBeachStartClock,
  type StripePromoLike,
} from "../../../lib/ordering/time";
import { useFoodBag } from "../../../contexts/FoodBagContext";
import StripeCardForm from "../../../components/checkout/StripeCardForm";
import CustomerAuthPanel from "../../../components/auth/CustomerAuthPanel";
import { useCustomerAuth } from "../../../contexts/CustomerAuthContext";
import {
  createPaymentIntentClientSecret,
  isStripeConfigured,
  validateStripePromoCode,
  type StripePromoResult,
} from "../../../lib/services/stripePayment";
import { isSupabaseConfigured } from "../../../lib/services/supabase";
import { placeOrderAndDispatch } from "../../../lib/services/orderDispatch";
import { CONTACT_PHONE_REQUIRED_MESSAGE, isValidContactPhone } from "../../../lib/ordering/phone";
import { SMS_CONSENT_REQUIRED_MESSAGE } from "../../../lib/ordering/smsConsent";
import SmsConsentCheckbox from "../../../components/SmsConsentCheckbox";
import { rememberWebOrder } from "../../../lib/ordering/webOrders";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function FoodCheckoutPage() {
  const router = useRouter();
  const { user: authUser, initialized: authInitialized, authRequiredMode } = useCustomerAuth();
  const { lines, setQty, clear, subtotal } = useFoodBag();
  const restaurant = getFoodRestaurant(lines[0]?.restaurantId ?? "watermans");
  const deliveryFee = restaurant?.deliveryFee ?? 8.99;
  const minimum = restaurant?.minimumOrder ?? 24.99;

  const [timingMode, setTimingMode] = useState<"asap" | "schedule">("asap");
  const [startTime, setStartTime] = useState<string>(FOOD_DELIVERY_START_TIMES[0]);
  const [streetName, setStreetName] = useState(BEACH_LOCATION_OPTIONS[10]?.streetName ?? "");
  const [tip, setTip] = useState(FOOD_TIP_DEFAULT);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [promoCodeDraft, setPromoCodeDraft] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<StripePromoResult | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const confirmRef = useRef<((clientSecret: string) => Promise<string | undefined>) | null>(null);

  const serviceDate = useMemo(() => startOfDay(new Date()), []);
  const windowOpen = isFoodDrinkOrderWindowOpen();

  const availableSlots = useMemo(() => {
    const nowMins = easternMinutesSinceMidnight(new Date());
    return FOOD_DELIVERY_START_TIMES.filter((t) => {
      const clock = parseBeachStartClock(t);
      if (!clock) return false;
      return clock.hour * 60 + clock.minute > nowMins;
    });
  }, []);

  const asapTime = availableSlots[0] ?? "";
  const selectedStart = timingMode === "asap" ? asapTime : startTime;
  const endTime = selectedStart
    ? formatBookingEndTime(serviceDate, selectedStart, FOOD_ONLY_WINDOW_HOURS)
    : "";

  const appliedPromoLike = useMemo((): StripePromoLike => {
    if (!appliedPromo) return null;
    return {
      percentOff: appliedPromo.percentOff,
      amountOffCents: appliedPromo.amountOffCents,
      description: appliedPromo.description,
    };
  }, [appliedPromo]);

  const totals = computeCheckoutTotals({
    merchandiseUsd: subtotal,
    deliveryFeeUsd: deliveryFee,
    onDemandSurchargeUsd: 0,
    tipUsd: tip,
    promo: appliedPromoLike,
  });

  const location = BEACH_LOCATION_OPTIONS.find((l) => l.streetName === streetName);

  const registerConfirm = useCallback((fn: (clientSecret: string) => Promise<string | undefined>) => {
    confirmRef.current = fn;
  }, []);

  const handleApplyPromo = async () => {
    const code = promoCodeDraft.trim();
    if (!code) return;
    if (!isSupabaseConfigured()) {
      setPromoError("Promo codes require cloud checkout.");
      return;
    }
    setPromoBusy(true);
    setPromoError("");
    try {
      const promo = await validateStripePromoCode(code);
      setAppliedPromo(promo);
      setAppliedPromoCode(code);
      toast.success(promo.description || "Promo applied");
    } catch (error) {
      setAppliedPromo(null);
      setAppliedPromoCode("");
      setPromoError(error instanceof Error ? error.message : "Invalid promo code.");
    } finally {
      setPromoBusy(false);
    }
  };

  const handleClearPromo = () => {
    setAppliedPromo(null);
    setAppliedPromoCode("");
    setPromoCodeDraft("");
    setPromoError("");
  };

  if (!lines.length) {
    return (
      <div className="min-h-screen bg-[hsl(200,20%,98%)]">
        <SiteNav />
        <div className="flex flex-col items-center justify-center gap-3 px-4 pt-32">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Button asChild className="rounded-full">
            <Link href="/food">Browse food</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (authInitialized && authRequiredMode && !authUser) {
    return (
      <div className="min-h-screen bg-[hsl(200,20%,98%)] px-4 pt-28 pb-16">
        <SiteNav />
        <div className="mb-8 text-center">
          <Link href="/food" className="text-sm font-semibold text-[#3b82b6] hover:underline">
            ← Back to food
          </Link>
        </div>
        <CustomerAuthPanel title="Sign in to order food" />
      </div>
    );
  }

  const placeOrder = async () => {
    if (authRequiredMode && !authUser) {
      toast.error("Sign in to place your order.");
      return;
    }
    if (!windowOpen) {
      toast.error(`Food delivery is available ${FOOD_SCHEDULE_LABEL}.`);
      return;
    }
    if (subtotal + 1e-6 < minimum) {
      toast.error(`Add more to reach the $${minimum.toFixed(2)} restaurant minimum.`);
      return;
    }
    if (!name.trim()) {
      toast.error("Enter your name.");
      return;
    }
    if (!isValidContactPhone(phone)) {
      toast.error(CONTACT_PHONE_REQUIRED_MESSAGE);
      return;
    }
    if (!smsConsent) {
      toast.error(SMS_CONSENT_REQUIRED_MESSAGE);
      return;
    }
    if (!location || !selectedStart) {
      toast.error("Pick a delivery time and beach location.");
      return;
    }
    if (!isSupabaseConfigured() || !isStripeConfigured()) {
      toast.error("Online checkout isn’t configured yet.");
      return;
    }
    if (!stripeReady || !confirmRef.current) {
      toast.error("Complete payment details first.");
      return;
    }

    setSubmitting(true);
    try {
      const clientSecret = await createPaymentIntentClientSecret(
        Math.round(totals.orderTotalUsd * 100),
        appliedPromoCode || undefined,
      );
      const paymentIntentId = await confirmRef.current(clientSecret);
      if (!paymentIntentId) throw new Error("Payment did not complete.");

      const { orderId, trackingToken } = await placeOrderAndDispatch({
        customerName: name.trim(),
        customerEmail: authUser?.email || undefined,
        customerPhone: phone.trim(),
        customerAuthId: authUser?.id,
        stripePaymentIntentId: paymentIntentId,
        locationDisplayName: location.displayName,
        locationFullAddress: location.fullAddress,
        serviceDate,
        startTime: selectedStart,
        endTime,
        crewNotes: `Food: ${restaurant?.name ?? "Food"}${
          appliedPromoCode ? ` · Promo ${appliedPromoCode}` : ""
        }`,
        tipAmount: tip,
        subtotal: totals.netMerchandiseUsd,
        serviceFee: totals.netDeliveryFeeUsd,
        totalAmount: totals.orderTotalUsd,
        items: lines.map((l) => ({
          id: l.menuItemId,
          type: "food" as const,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          foodRestaurantId: l.restaurantId,
          foodRestaurantName: l.restaurantName,
        })),
      });

      if (trackingToken) {
        rememberWebOrder({
          id: orderId,
          trackingToken,
          title: restaurant?.name ? `${restaurant.name} food` : "Food & drinks",
          detailLines: lines.map((l) => `${l.quantity}× ${l.name}`),
          locationLabel: location.displayName,
          serviceDateLabel: "Today",
          startTime: selectedStart,
          endTime,
          totalAmount: totals.orderTotalUsd,
          createdAt: new Date().toISOString(),
          foodOnly: true,
        });
      }

      clear();
      router.push(
        `/food/confirmation?id=${orderId}&eta=${encodeURIComponent(FOOD_ASAP_ETA_LABEL)}${
          trackingToken ? `&token=${encodeURIComponent(trackingToken)}` : ""
        }`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)]">
      <SiteNav />

      <main className="mx-auto grid max-w-5xl gap-8 px-4 pb-16 pt-28 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-[#083b6c]">Food checkout</h1>
              <Link
                href={`/food/${restaurant?.id ?? "watermans"}`}
                className="text-sm font-semibold text-[#3b82b6] hover:underline"
              >
                ← Back to menu
              </Link>
            </div>
            <Button asChild variant="outline" className="rounded-full border-[#083b6c] text-[#083b6c]">
              <Link href="/#services">Add beach packages</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-[#083b6c]/20 bg-[#e6f9ff]/70 px-4 py-3 text-sm text-[#083b6c]">
            Want chairs & shade too?{" "}
            <Link href="/#services" className="font-semibold underline underline-offset-2">
              Add a package
            </Link>
            , then checkout gear + food together in booking — your food bag is saved.
          </div>

          {!windowOpen ? (
            <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
              Food ordering is closed right now. Open {FOOD_SCHEDULE_LABEL}.
            </p>
          ) : null}

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-semibold text-[#083b6c]">{FOOD_ASAP_ETA_LABEL}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!asapTime}
                onClick={() => setTimingMode("asap")}
                className={cn(
                  "rounded-xl border-2 p-3 text-left text-sm",
                  timingMode === "asap" ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border",
                )}
              >
                ASAP
              </button>
              <button
                type="button"
                onClick={() => setTimingMode("schedule")}
                className={cn(
                  "rounded-xl border-2 p-3 text-left text-sm",
                  timingMode === "schedule" ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border",
                )}
              >
                Schedule later today
              </button>
            </div>
            {timingMode === "schedule" ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {availableSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setStartTime(t)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-semibold",
                      startTime === t ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-[#083b6c]">Deliver to beach</p>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {BEACH_LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.streetName}
                  type="button"
                  onClick={() => setStreetName(opt.streetName)}
                  className={cn(
                    "flex w-full rounded-xl border px-3 py-2 text-left text-sm",
                    streetName === opt.streetName ? "border-[#083b6c] bg-[#e6f9ff]" : "border-transparent hover:bg-muted",
                  )}
                >
                  {opt.displayName}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
            {lines.map((l) => (
              <div key={l.key} className="flex items-center gap-3">
                <img src={l.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#083b6c]">{l.name}</p>
                  <p className="text-xs text-muted-foreground">${l.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 rounded-full p-0" onClick={() => setQty(l.key, l.quantity - 1)}>
                    −
                  </Button>
                  <span className="w-5 text-center text-sm font-bold">{l.quantity}</span>
                  <Button size="sm" variant="outline" className="h-7 w-7 rounded-full p-0" onClick={() => setQty(l.key, l.quantity + 1)}>
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input className="h-12 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>
              Phone{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (required — cancellations, refunds, emergencies)
              </span>
            </Label>
            <Input
              className="h-12 rounded-xl"
              type="tel"
              required
              placeholder="(757) 555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <SmsConsentCheckbox id="food-web-sms-consent" checked={smsConsent} onCheckedChange={setSmsConsent} />

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-[#083b6c]">Promo code</p>
            {appliedPromo ? (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-[#083b6c]/25 bg-[#e6f9ff] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#083b6c]">{appliedPromoCode}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{appliedPromo.description}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearPromo}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-white/80 hover:text-foreground"
                  aria-label="Remove promo code"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={promoCodeDraft}
                  onChange={(e) => {
                    setPromoCodeDraft(e.target.value.toUpperCase());
                    if (promoError) setPromoError("");
                  }}
                  placeholder="Enter code"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  className="h-11 flex-1 rounded-xl uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-xl px-4"
                  disabled={promoBusy || !promoCodeDraft.trim()}
                  onClick={() => void handleApplyPromo()}
                >
                  {promoBusy ? "…" : "Apply"}
                </Button>
              </div>
            )}
            {promoError ? <p className="mt-2 text-xs text-destructive">{promoError}</p> : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Driver tip</p>
            <div className="flex flex-wrap gap-2">
              {FOOD_TIP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTip(amt)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    tip === amt ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border",
                  )}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <StripeCardForm
              amountCents={Math.round(totals.orderTotalUsd * 100)}
              onReady={setStripeReady}
              registerConfirm={registerConfirm}
            />
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-white p-5 shadow-soft lg:sticky lg:top-20">
          <h2 className="font-bold text-[#083b6c]">Order summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            {totals.discountUsd > 0 ? (
              <div className="flex justify-between text-[#083b6c]">
                <span>Promo{appliedPromoCode ? ` (${appliedPromoCode})` : ""}</span>
                <span>−${totals.discountUsd.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Tip</span>
              <span>${tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-[#083b6c]">
              <span>Total</span>
              <span>${totals.orderTotalUsd.toFixed(2)}</span>
            </div>
          </div>
          {subtotal + 1e-6 < minimum ? (
            <p className="mt-3 text-xs text-destructive">
              ${ (minimum - subtotal).toFixed(2) } more to meet restaurant minimum.
            </p>
          ) : null}
          <Button
            className="mt-5 w-full rounded-full bg-[#083b6c]"
            disabled={submitting || !windowOpen || !name.trim() || !isValidContactPhone(phone) || !smsConsent}
            onClick={() => void placeOrder()}
          >
            {submitting ? "Placing order…" : `Place order · $${totals.orderTotalUsd.toFixed(2)}`}
          </Button>
        </aside>
      </main>
    </div>
  );
}
