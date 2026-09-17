"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { ArrowLeft, Check, Lock, X } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { cn } from "../../lib/utils";
import {
  CUSTOM_GEAR,
  CUSTOM_MIN_SUBTOTAL_USD,
  DELIVERY_FEE,
  DURATION_OPTIONS,
  GEAR_SETUP_START_TIMES,
  GEAR_TIP_PRESETS,
  ON_DEMAND_PACKAGE_SURCHARGE_USD,
  PACKAGES,
  type PackageId,
  customGearUnitPrice,
  getFoodRestaurant,
  isPremiumSetupStart,
  quotedPackagePrice,
} from "../../lib/ordering/catalog";
import { useFoodBag } from "../../contexts/FoodBagContext";
import { dropSpotsForMarket } from "../../lib/ordering/beachLocations";
import { MARKETS, persistMarket, readStoredMarket, type MarketId } from "../../lib/ordering/markets";
import {
  computeCheckoutTotals,
  formatBookingEndTime,
  isSameDayGearCutoffPassed,
  isSameZonedDay,
  parseBeachStartClock,
  rentalEndsAfterPickupCutoff,
  zonedCalendarDate,
  zonedDateKey,
  zonedMinutesSinceMidnight,
  type StripePromoLike,
} from "../../lib/ordering/time";
import {
  isStripeConfigured,
  createPaymentIntentClientSecret,
  validateStripePromoCode,
  type StripePromoResult,
} from "../../lib/services/stripePayment";
import { isSupabaseConfigured } from "../../lib/services/supabase";
import { placeOrderAndDispatch } from "../../lib/services/orderDispatch";
import { fetchOutstandingGearPoolCounts } from "../../lib/services/outstandingGearPool";
import {
  canSellCustomQty,
  canSellPackage,
  remainingCustomUnits,
  type InventoryBucket,
} from "../../lib/ordering/inventory";
import StripeCardForm from "../checkout/StripeCardForm";
import CustomerAuthPanel from "../auth/CustomerAuthPanel";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { CONTACT_PHONE_REQUIRED_MESSAGE, isValidContactPhone } from "../../lib/ordering/phone";
import { SMS_CONSENT_REQUIRED_MESSAGE } from "../../lib/ordering/smsConsent";
import SmsConsentCheckbox from "../SmsConsentCheckbox";
import { rememberWebOrder } from "../../lib/ordering/webOrders";
import {
  checkoutFingerprint,
  checkoutIdempotencyKey,
  clearPendingCheckoutPayment,
  reusePendingPayment,
  writePendingCheckoutPayment,
} from "../../lib/ordering/pendingCheckoutPayment";
import { assertOrderingOpen, fetchOrderingStatus } from "../../lib/services/orderingEnabled";
import { assertCheckoutAllowed, fetchSameDayOrdersEnabled } from "../../lib/services/sameDayOrdering";
import { assertFoodOrderingOpen } from "../../lib/services/foodOrderingEnabled";
import { toast } from "sonner";

const STEPS = ["City", "Date", "Package", "Duration", "Location", "Pay"] as const;

type Mode = "package" | "custom";

export default function BookingClient() {
  const search = useSearchParams();
  const { user: authUser, initialized: authInitialized, authRequiredMode, signOut } = useCustomerAuth();
  const { lines: foodLines, subtotal: foodSubtotal, clear: clearFoodBag } = useFoodBag();
  const [step, setStep] = useState(() => (readStoredMarket() ? 1 : 0));
  const [marketId, setMarketId] = useState<MarketId>(() => readStoredMarket() ?? "vb");
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [durationHours, setDurationHours] = useState(6);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [mode, setMode] = useState<Mode>("package");
  const [packageId, setPackageId] = useState<PackageId>("sandy-duo");
  const [customQty, setCustomQty] = useState<Record<string, number>>({});
  const [streetName, setStreetName] = useState(
    () => dropSpotsForMarket(readStoredMarket() ?? "vb")[0]?.id ?? "",
  );
  const [tip, setTip] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [notes, setNotes] = useState("");
  const [stripeReady, setStripeReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmedTrackingToken, setConfirmedTrackingToken] = useState<string | null>(null);
  const [serverPool, setServerPool] = useState<Record<InventoryBucket, number> | null>(null);
  const [poolReady, setPoolReady] = useState(false);
  const [promoCodeDraft, setPromoCodeDraft] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<StripePromoResult | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [sameDayEnabled, setSameDayEnabled] = useState(true);
  const confirmRef = useRef<((clientSecret: string) => Promise<string | undefined>) | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchOrderingStatus().then((status) => {
      if (cancelled || !status.known) return;
      setOrderingEnabled(status.enabled);
      if (!status.enabled) setServiceDate(null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pkg = search.get("package") as PackageId | null;
    const custom = search.get("custom");
    if (pkg && PACKAGES.some((p) => p.id === pkg)) {
      setPackageId(pkg);
      setMode("package");
      setStep(readStoredMarket() ? 1 : 0);
    }
    if (custom && CUSTOM_GEAR.some((g) => g.id === custom)) {
      setMode("custom");
      setCustomQty((q) => ({ ...q, [custom]: Math.max(1, q[custom] ?? 0) }));
    }
  }, [search]);

  useEffect(() => {
    if (authUser?.email && !email) {
      setEmail(authUser.email);
    }
  }, [authUser?.email, email]);

  useEffect(() => {
    if (marketId === "pcb") clearFoodBag();
  }, [marketId, clearFoodBag]);

  useEffect(() => {
    let cancelled = false;
    void fetchSameDayOrdersEnabled(marketId).then((enabled) => {
      if (!cancelled) setSameDayEnabled(enabled);
    });
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  /** Same outstanding-gear pool RPC as iOS/Android — inventory stays in sync. */
  useEffect(() => {
    if (!serviceDate || !isSupabaseConfigured()) {
      setServerPool(null);
      setPoolReady(false);
      return;
    }
    let cancelled = false;
    setPoolReady(false);
    const day = zonedDateKey(serviceDate, MARKETS[marketId].timezone);
    const pull = async (isRefresh = false) => {
      const snap = await fetchOutstandingGearPoolCounts(day, marketId);
      if (!cancelled) {
        setServerPool(snap);
        if (!isRefresh) setPoolReady(true);
      }
    };
    void pull(false);
    const id = window.setInterval(() => void pull(true), 35_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [serviceDate, marketId]);

  useEffect(() => {
    if (!serverPool) return;
    setCustomQty((q) => {
      const next = { ...q };
      let changed = false;
      for (const sku of Object.keys(next)) {
        while ((next[sku] ?? 0) > 0 && !canSellCustomQty(next, serverPool, marketId)) {
          next[sku] = (next[sku] ?? 0) - 1;
          changed = true;
        }
      }
      return changed ? next : q;
    });
  }, [serverPool, marketId]);

  const scheduleTz = MARKETS[marketId].timezone;
  const clockZone = MARKETS[marketId].clockZoneLabel;
  const todayInMarket = zonedCalendarDate(new Date(), scheduleTz);
  const isSameDay = serviceDate ? isSameZonedDay(serviceDate, new Date(), scheduleTz) : false;
  const sameDayCutoffPassed = isSameDayGearCutoffPassed(new Date(), scheduleTz);
  const sameDayBlocked = !sameDayEnabled || sameDayCutoffPassed;
  const onDemand = isSameDay ? ON_DEMAND_PACKAGE_SURCHARGE_USD : 0;
  const checkoutSpots = dropSpotsForMarket(marketId);
  const includeFood = marketId === "vb" && foodLines.length > 0;

  const customMerchandiseForHours = useCallback(
    (hours: number, start = startTime) =>
      Object.entries(customQty).reduce((sum, [sku, qty]) => {
        if (!qty) return sum;
        return sum + customGearUnitPrice(sku, hours, start) * qty;
      }, 0),
    [customQty, startTime],
  );

  const setupPreviewForHours = useCallback(
    (hours: number, start = startTime) => {
      const customTotal = customMerchandiseForHours(hours, start);
      if (mode === "custom" && customTotal > 0) return customTotal;
      return quotedPackagePrice(packageId, start, hours);
    },
    [customMerchandiseForHours, mode, packageId, startTime],
  );

  const gearMerchandise = useMemo(() => {
    if (mode === "package") {
      return quotedPackagePrice(packageId, startTime, durationHours);
    }
    return customMerchandiseForHours(durationHours, startTime);
  }, [mode, packageId, startTime, durationHours, customMerchandiseForHours]);

  const foodRestaurant = includeFood
    ? getFoodRestaurant(foodLines[0]!.restaurantId)
    : undefined;
  const foodDeliveryFee = includeFood ? (foodRestaurant?.deliveryFee ?? 8.99) : 0;
  const foodMinimum = foodRestaurant?.minimumOrder ?? 24.99;
  const merchandise = gearMerchandise + (includeFood ? foodSubtotal : 0);
  const deliveryFees = DELIVERY_FEE + foodDeliveryFee;

  const appliedPromoLike = useMemo((): StripePromoLike => {
    if (!appliedPromo) return null;
    return {
      percentOff: appliedPromo.percentOff,
      amountOffCents: appliedPromo.amountOffCents,
      description: appliedPromo.description,
    };
  }, [appliedPromo]);

  const totals = computeCheckoutTotals({
    merchandiseUsd: merchandise,
    deliveryFeeUsd: deliveryFees,
    onDemandSurchargeUsd: onDemand,
    tipUsd: tip,
    promo: appliedPromoLike,
  });

  const location = checkoutSpots.find((l) => l.id === streetName);
  const endTime = serviceDate ? formatBookingEndTime(serviceDate, startTime, durationHours, scheduleTz) : "";
  const pkg = PACKAGES.find((p) => p.id === packageId)!;

  const pickupFullBlocked = Boolean(
    serviceDate && startTime && rentalEndsAfterPickupCutoff(serviceDate, startTime, 6, undefined, scheduleTz),
  );
  const pickupShoreBlocked = Boolean(
    serviceDate && startTime && rentalEndsAfterPickupCutoff(serviceDate, startTime, 8, undefined, scheduleTz),
  );

  useEffect(() => {
    if (!serviceDate || !startTime) return;
    if (durationHours === 8 && pickupShoreBlocked) {
      setDurationHours(pickupFullBlocked ? 3 : 6);
    } else if (durationHours === 6 && pickupFullBlocked) {
      setDurationHours(3);
    }
  }, [serviceDate, startTime, durationHours, pickupShoreBlocked, pickupFullBlocked]);

  const availableStartTimes = useMemo((): string[] => {
    const times: string[] = [...GEAR_SETUP_START_TIMES];
    if (!serviceDate || !isSameZonedDay(serviceDate, new Date(), scheduleTz)) return times;
    const nowMins = zonedMinutesSinceMidnight(new Date(), scheduleTz);
    return times.filter((t) => {
      const clock = parseBeachStartClock(t);
      if (!clock) return false;
      return clock.hour * 60 + clock.minute > nowMins;
    });
  }, [serviceDate, scheduleTz]);

  useEffect(() => {
    if (!availableStartTimes.includes(startTime) && availableStartTimes[0]) {
      setStartTime(availableStartTimes[0]);
    }
  }, [availableStartTimes, startTime]);

  const durationPriceNote =
    mode === "custom" && customMerchandiseForHours(durationHours) > 0
      ? "Prices for your custom gear"
      : `Prices for ${pkg.name}`;

  const selectionAvailable = useMemo(() => {
    if (!poolReady || !serverPool) return false;
    if (mode === "package") return canSellPackage(packageId, serverPool, marketId);
    return canSellCustomQty(customQty, serverPool, marketId);
  }, [poolReady, serverPool, mode, packageId, customQty, marketId]);

  const canContinue = () => {
    if (step === 0) return Boolean(marketId);
    if (!orderingEnabled && step >= 1) return false;
    if (step === 1) {
      if (!serviceDate) return false;
      if (isSameZonedDay(serviceDate, new Date(), scheduleTz) && sameDayBlocked) return false;
      return true;
    }
    if (step === 2) {
      if (mode === "package") return selectionAvailable;
      return selectionAvailable && gearMerchandise + 1e-6 >= CUSTOM_MIN_SUBTOTAL_USD;
    }
    if (step === 3) return Boolean(startTime && durationHours && availableStartTimes.length > 0);
    if (step === 4) return Boolean(location);
    return true;
  };

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

  const placeOrder = async () => {
    if (!serviceDate || !location) return;
    try {
      await assertOrderingOpen();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ordering is paused right now.");
      return;
    }
    if (includeFood) {
      try {
        await assertFoodOrderingOpen();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Food ordering is paused right now.");
        return;
      }
    }
    if (authRequiredMode && !authUser) {
      toast.error("Sign in to place your order.");
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
    if (mode === "custom" && gearMerchandise + 1e-6 < CUSTOM_MIN_SUBTOTAL_USD) {
      toast.error(`Custom gear needs at least $${CUSTOM_MIN_SUBTOTAL_USD.toFixed(2)}.`);
      return;
    }
    if (includeFood && foodSubtotal + 1e-6 < foodMinimum) {
      toast.error(`${foodRestaurant?.name ?? "Food"} needs at least $${foodMinimum.toFixed(2)}.`);
      return;
    }
    if (isSameDay && sameDayCutoffPassed) {
      toast.error(`Same-day booking closed after 4:00 PM ${clockZone}.`);
      return;
    }
    const serviceDateKey = zonedDateKey(serviceDate, scheduleTz);
    try {
      await assertCheckoutAllowed(marketId, serviceDateKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ordering is paused right now.";
      toast.error(message);
      return;
    }
    if (!isSupabaseConfigured() || !isStripeConfigured()) {
      toast.error("Online checkout isn’t configured yet. Email Admin@shoredropapp.com or use the app.");
      return;
    }
    if (submitting) return;
    if (!stripeReady || !confirmRef.current) {
      toast.error("Complete payment details first.");
      return;
    }

    setSubmitting(true);
    const freshPool = await fetchOutstandingGearPoolCounts(serviceDateKey, marketId);
    setServerPool(freshPool);
    if (!freshPool) {
      toast.error("Couldn’t check gear availability. Try again in a moment.");
      setSubmitting(false);
      return;
    }
    if (mode === "package" && !canSellPackage(packageId, freshPool, marketId)) {
      toast.error("That package is sold out for this date — pick another or try a different day.");
      setSubmitting(false);
      return;
    }
    if (mode === "custom" && !canSellCustomQty(customQty, freshPool, marketId)) {
      toast.error("Not enough gear left for that custom setup on this date.");
      setSubmitting(false);
      return;
    }

    const amountCents = Math.round(totals.orderTotalUsd * 100);
    const fingerprint = checkoutFingerprint([
      marketId,
      serviceDateKey,
      mode,
      packageId,
      JSON.stringify(customQty),
      streetName,
      startTime,
      durationHours,
      amountCents,
    ]);

    try {
      let paymentIntentId = reusePendingPayment({
        amountCents,
        marketId,
        serviceDate: serviceDateKey,
        fingerprint,
      });
      if (!paymentIntentId) {
        const clientSecret = await createPaymentIntentClientSecret(
          amountCents,
          appliedPromoCode || undefined,
          {
            marketId,
            serviceDate: serviceDateKey,
            idempotencyKey: checkoutIdempotencyKey(fingerprint),
            ...(includeFood ? { includesFood: true } : {}),
          },
        );
        paymentIntentId = (await confirmRef.current(clientSecret)) ?? "";
        if (!paymentIntentId) throw new Error("Payment did not complete.");
        writePendingCheckoutPayment({
          paymentIntentId,
          amountCents,
          marketId,
          serviceDate: serviceDateKey,
          fingerprint,
        });
      }

      const gearItems =
        mode === "package"
          ? [
              {
                id: packageId,
                type: "package" as const,
                name: pkg.name,
                price: gearMerchandise,
                quantity: 1,
                catalogPackageId: packageId,
                includes: [...pkg.items],
              },
            ]
          : Object.entries(customQty)
              .filter(([, q]) => q > 0)
              .map(([sku, quantity]) => {
                const gear = CUSTOM_GEAR.find((g) => g.id === sku)!;
                return {
                  id: sku,
                  type: "custom" as const,
                  name: gear.name,
                  price: customGearUnitPrice(sku, durationHours),
                  quantity,
                };
              });

      const foodItems =
        marketId === "vb"
          ? foodLines.map((l) => ({
              id: l.menuItemId,
              type: "food" as const,
              name: l.name,
              price: l.price,
              quantity: l.quantity,
              foodRestaurantId: l.restaurantId,
              foodRestaurantName: l.restaurantName,
            }))
          : [];

      const items = [...gearItems, ...foodItems];
      const detailLines = [
        ...gearItems.flatMap((g) => {
          if (g.type === "package") {
            return [`1× ${g.name}`, ...(g.includes ?? [])];
          }
          return [`${g.quantity}× ${g.name}`];
        }),
        ...foodItems.map((l) => `${l.quantity}× ${l.name}`),
      ];

      const { orderId, trackingToken, dispatchNotified } = await placeOrderAndDispatch({
        customerName: name.trim(),
        customerEmail: email.trim() || authUser?.email || undefined,
        customerPhone: phone.trim(),
        customerAuthId: authUser?.id,
        stripePaymentIntentId: paymentIntentId,
        locationDisplayName: location.displayName,
        locationFullAddress: location.fullAddress,
        marketId,
        serviceDate,
        serviceDateKey,
        startTime,
        endTime,
        crewNotes: [
          notes.trim(),
          appliedPromoCode ? `Promo ${appliedPromoCode}` : "",
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
        tipAmount: tip,
        subtotal: totals.netMerchandiseUsd,
        serviceFee: totals.netDeliveryFeeUsd,
        totalAmount: totals.orderTotalUsd,
        items,
      });

      if (trackingToken) {
        rememberWebOrder({
          id: orderId,
          trackingToken,
          title: mode === "package" ? pkg.name : foodLines.length ? "Beach setup + food" : "Custom beach setup",
          detailLines,
          locationLabel: location.displayName,
          serviceDateLabel: format(serviceDate, "EEE, MMM d"),
          startTime,
          endTime,
          totalAmount: totals.orderTotalUsd,
          createdAt: new Date().toISOString(),
          foodOnly: false,
        });
        setConfirmedTrackingToken(trackingToken);
      }

      clearFoodBag();
      clearPendingCheckoutPayment();
      setConfirmedId(orderId);
      if (dispatchNotified) toast.success("Booking confirmed");
      else toast.success("Booking paid");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not complete booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authInitialized && authRequiredMode && !authUser) {
    return (
      <div className="min-h-screen bg-[hsl(200,20%,98%)] px-4 py-16">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm font-semibold text-[#3b82b6] hover:underline">
            ← Back to home
          </Link>
        </div>
        <CustomerAuthPanel title="Sign in to book" />
      </div>
    );
  }

  if (confirmedId) {
    return (
      <div className="min-h-screen bg-[hsl(200,20%,98%)] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-wave">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#083b6c]">Booking confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">Order {confirmedId.slice(0, 8).toUpperCase()}</p>
          <p className="mt-4 text-sm text-[#083b6c]">
            {serviceDate ? format(serviceDate, "EEEE, MMM d") : ""} · {startTime} – {endTime}
          </p>
          <p className="text-sm text-muted-foreground">{location?.displayName}</p>
          <div className="mt-8 flex flex-col gap-2">
            <Button asChild className="rounded-full bg-[#083b6c]">
              <Link href={confirmedTrackingToken ? `/orders?focus=${confirmedId}` : "/orders"}>
                Track order & chat
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/food">Add Food & Drinks</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)]">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Link href="/#services" className="rounded-full p-2 hover:bg-muted" aria-label="Back to packages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/lovable-uploads/dbf79a37-c86d-49c9-af90-9fe7b44058fc.jpg"
              alt="ShoreDrop"
              className="h-9 w-9 rounded-full"
            />
            <span className="hidden text-lg font-semibold text-[#083b6c] sm:inline">ShoreDrop</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#083b6c]">Book your beach day</p>
            <p className="text-[11px] text-muted-foreground">
              {MARKETS[marketId].name} · Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
            {step > 0 ? (
              <button
                type="button"
                className="text-[11px] font-semibold text-[#3b82b6] hover:underline"
                onClick={() => setStep(0)}
              >
                Change city
              </button>
            ) : null}
          </div>
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </span>
          {authUser ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-xs font-medium text-muted-foreground hover:text-[#083b6c]"
            >
              Sign out
            </button>
          ) : null}
        </div>
        <div className="container mx-auto flex gap-1 px-4 pb-3">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-[#083b6c]" : "bg-muted",
              )}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {includeFood && step > 0 ? (
          <div className="mb-5 rounded-2xl border border-[#083b6c]/20 bg-[#e6f9ff]/70 px-4 py-3 text-sm text-[#083b6c]">
            Food in bag: ${foodSubtotal.toFixed(2)} from {foodRestaurant?.name ?? "partner"} — included at checkout.
          </div>
        ) : null}
        {step === 0 ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#083b6c]">Which beach?</h2>
            <p className="text-sm text-muted-foreground">
              Virginia Beach or Panama City Beach. Same packages — local drop spots next.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["vb", "pcb"] as MarketId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMarketId(id);
                    persistMarket(id);
                    setStreetName(dropSpotsForMarket(id)[0]?.id ?? "");
                    if (id === "pcb") clearFoodBag();
                  }}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left",
                    marketId === id ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border bg-white",
                  )}
                >
                  <p className="font-bold text-[#083b6c]">{MARKETS[id].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {id === "pcb" ? "Now serving Panama City Beach, FL" : MARKETS[id].serviceAreaLabel}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#083b6c]">When&apos;s your beach day?</h2>
            <p className="text-sm text-muted-foreground">
              Next we&apos;ll show which setups are still available for that date. Times are {clockZone}.
            </p>
            {!orderingEnabled ? (
              <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                Ordering is paused right now. On-Demand and future dates are closed until staff turn it back on.
              </p>
            ) : !sameDayEnabled ? (
              <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                Same-day delivery is paused at {MARKETS[marketId].name}. Advance dates are still open.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!orderingEnabled || sameDayBlocked}
                onClick={() => {
                  if (!orderingEnabled) {
                    toast.error("Ordering is paused right now.");
                    return;
                  }
                  if (!sameDayEnabled) {
                    toast.error("Same-day delivery is paused right now. Pick a future date.");
                    return;
                  }
                  if (sameDayCutoffPassed) {
                    toast.error(`Same-day booking closed after 4:00 PM ${clockZone}.`);
                    return;
                  }
                  setServiceDate(todayInMarket);
                }}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left",
                  (!orderingEnabled || sameDayBlocked) && "cursor-not-allowed opacity-60",
                  serviceDate && isSameZonedDay(serviceDate, new Date(), scheduleTz)
                    ? "border-[#083b6c] bg-[#e6f9ff]"
                    : "border-border bg-white",
                )}
              >
                <p className="font-bold text-[#083b6c]">On-Demand (today)</p>
                <p className="text-xs text-muted-foreground">
                  {!orderingEnabled
                    ? "Paused"
                    : !sameDayEnabled
                      ? "Paused for today"
                      : sameDayCutoffPassed
                        ? `Closed after 4:00 PM ${clockZone}`
                        : `+$${ON_DEMAND_PACKAGE_SURCHARGE_USD.toFixed(2)} same-day fee`}
                </p>
              </button>
              <button
                type="button"
                disabled={!orderingEnabled}
                onClick={() => {
                  if (!orderingEnabled) {
                    toast.error("Ordering is paused right now.");
                    return;
                  }
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setServiceDate(startOfDay(d));
                }}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left",
                  !orderingEnabled && "cursor-not-allowed opacity-60",
                  serviceDate && !isSameZonedDay(serviceDate, new Date(), scheduleTz)
                    ? "border-[#083b6c] bg-[#e6f9ff]"
                    : "border-border bg-white",
                )}
              >
                <p className="font-bold text-[#083b6c]">Pre-order</p>
                <p className="text-xs text-muted-foreground">
                  {!orderingEnabled ? "Paused" : "Pick a future date below"}
                </p>
              </button>
            </div>
            <div>
              <Label htmlFor="svc-date">Service date</Label>
              <Input
                id="svc-date"
                type="date"
                disabled={!orderingEnabled}
                className="mt-1 h-12 rounded-xl"
                min={
                  sameDayBlocked
                    ? (() => {
                        const n = new Date(
                          todayInMarket.getFullYear(),
                          todayInMarket.getMonth(),
                          todayInMarket.getDate() + 1,
                        );
                        const yyyy = n.getFullYear();
                        const mm = String(n.getMonth() + 1).padStart(2, "0");
                        const dd = String(n.getDate()).padStart(2, "0");
                        return `${yyyy}-${mm}-${dd}`;
                      })()
                    : zonedDateKey(todayInMarket, scheduleTz)
                }
                value={serviceDate ? zonedDateKey(serviceDate, scheduleTz) : ""}
                onChange={(e) => {
                  if (!orderingEnabled || !e.target.value) return;
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  setServiceDate(startOfDay(new Date(y, m - 1, d)));
                }}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#083b6c]">Duration & setup time</h2>
            <p className="text-sm text-muted-foreground">
              {serviceDate ? format(serviceDate, "EEEE, MMM d") : ""} · rentals end by 7:00 PM {clockZone}
            </p>
            <p className="text-xs text-muted-foreground">{durationPriceNote} · + ${DELIVERY_FEE.toFixed(2)} delivery at checkout</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {DURATION_OPTIONS.map((opt) => {
                const blocked =
                  (opt.hours === 6 && pickupFullBlocked) || (opt.hours === 8 && pickupShoreBlocked);
                if (blocked) return null;
                const endLabel =
                  serviceDate && startTime
                    ? formatBookingEndTime(serviceDate, startTime, opt.hours, scheduleTz)
                    : "";
                const price = setupPreviewForHours(opt.hours);
                const selected = durationHours === opt.hours;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDurationHours(opt.hours)}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left",
                      selected ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border bg-white",
                    )}
                  >
                    <p className="font-bold text-[#083b6c]">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {opt.detail}
                      {endLabel ? ` · ${startTime} – ${endLabel}` : ""}
                    </p>
                    <p className={cn("mt-2 text-lg font-bold", selected ? "text-[#083b6c]" : "text-foreground")}>
                      ${price.toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
            {pickupFullBlocked || pickupShoreBlocked ? (
              <p className="text-xs text-muted-foreground leading-snug">
                With this start time, anything past{" "}
                <span className="font-medium text-foreground">7:00 PM {clockZone}</span> isn&apos;t offered — pick Half
                Day or an earlier start if you need a longer rental.
              </p>
            ) : null}
            <div>
              <p className="mb-2 text-sm font-medium">Setup start time</p>
              {availableStartTimes.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/40 px-4 py-5 text-center">
                  <p className="text-sm font-medium text-foreground">No setup times left today</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Same-day ordering closes at 4:00 PM {clockZone}. Choose another date or come back earlier tomorrow.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableStartTimes.map((t) => {
                    const premium = isPremiumSetupStart(t);
                    const selected = startTime === t;
                    const tPrice = setupPreviewForHours(durationHours, t);
                    const standardPrice = setupPreviewForHours(durationHours, "9:00 AM");
                    const extra = Math.max(0, Math.round((tPrice - standardPrice) * 100) / 100);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setStartTime(t)}
                        className={cn(
                          "rounded-xl border-2 px-2 py-2.5 text-left",
                          selected
                            ? "border-[#083b6c] bg-[#e6f9ff] text-[#083b6c]"
                            : "border-border bg-white",
                        )}
                      >
                        <p className="text-sm font-semibold">{t}</p>
                        {premium ? (
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#083b6c]/80">
                            Premium{extra > 0 ? ` +$${extra.toFixed(2)}` : ""}
                          </p>
                        ) : (
                          <p className="text-[10px] font-medium text-muted-foreground">Standard</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground leading-snug">
                All start times are {clockZone} (hourly 8:00 AM – 4:00 PM). Afternoon starts from 11:00 AM use premium
                package tiers. Half day is 3 hours; Full day is 6 hours; Shore Day is 8 hours.
              </p>
            </div>
            <div className="rounded-2xl border border-[#083b6c]/25 bg-[#e6f9ff]/60 px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#083b6c]">
                <Check className="h-4 w-4" />
                {DURATION_OPTIONS.find((o) => o.hours === durationHours)?.label ?? "Duration"} · {startTime}
                {endTime ? ` – ${endTime}` : ""}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Setup total</span>
                <span className="font-bold text-[#083b6c]">${setupPreviewForHours(durationHours).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">+ ${DELIVERY_FEE.toFixed(2)} delivery fee at checkout</p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#083b6c]">Choose your setup</h2>
              <p className="text-sm font-bold text-[#083b6c]">${gearMerchandise.toFixed(2)}</p>
            </div>
            {serviceDate ? (
              <p className="text-sm text-muted-foreground">
                Availability for {format(serviceDate, "EEEE, MMM d")}
              </p>
            ) : null}
            {!poolReady ? (
              <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Checking what&apos;s left for this date…
              </div>
            ) : !serverPool ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Couldn&apos;t check gear availability. Go back and try again in a moment.
              </div>
            ) : !selectionAvailable ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {mode === "package"
                  ? `${pkg.name} is sold out for this date. Pick another setup or a different day.`
                  : "Not enough gear left for that custom setup. Reduce items or pick another day."}
              </div>
            ) : null}
            {foodLines.length > 0 ? (
              <div className="rounded-2xl border border-[#083b6c]/20 bg-[#e6f9ff]/70 px-4 py-3 text-sm text-[#083b6c]">
                Food bag saved: {foodLines.reduce((n, l) => n + l.quantity, 0)} items from{" "}
                {foodRestaurant?.name ?? "partner"} (${foodSubtotal.toFixed(2)}) — checked out with your gear on the
                last step.{" "}
                <Link href="/food/checkout" className="font-semibold underline underline-offset-2">
                  Edit food
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Want meals too?{" "}
                <Link href="/food" className="font-semibold text-[#3b82b6] underline underline-offset-2">
                  Add Food & Drinks
                </Link>{" "}
                anytime — your package stays selected.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "package" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setMode("package")}
              >
                Packages
              </Button>
              <Button
                type="button"
                variant={mode === "custom" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setMode("custom")}
              >
                Customize
              </Button>
            </div>
            {mode === "package" ? (
              <div className="space-y-3">
                {PACKAGES.map((p) => {
                  const price = quotedPackagePrice(p.id, startTime, durationHours);
                  const soldOut = poolReady && !canSellPackage(p.id, serverPool, marketId);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setPackageId(p.id)}
                      className={cn(
                        "flex w-full gap-4 rounded-2xl border-2 p-4 text-left",
                        soldOut && "opacity-55",
                        packageId === p.id ? "border-[#083b6c] bg-[#e6f9ff]" : "border-border bg-white",
                      )}
                    >
                      <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-[#083b6c]">{p.name}</p>
                          <p className={cn("shrink-0 font-semibold", soldOut ? "text-destructive" : "text-[#083b6c]")}>
                            {soldOut ? "Sold out" : `$${price.toFixed(2)}`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.items.join(" · ")}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Custom minimum ${CUSTOM_MIN_SUBTOTAL_USD.toFixed(2)} · prices for {durationHours}h rental
                </p>
                {CUSTOM_GEAR.map((g) => {
                  const unit = customGearUnitPrice(g.id, durationHours);
                  const qty = customQty[g.id] ?? 0;
                  const left = remainingCustomUnits(g.id, serverPool);
                  const soldOut = poolReady && left <= 0;
                  const plusBlocked =
                    !poolReady ||
                    !canSellCustomQty({ ...customQty, [g.id]: qty + 1 }, serverPool, marketId);
                  return (
                    <div
                      key={g.id}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-border bg-white p-3",
                        soldOut && "opacity-55",
                      )}
                    >
                      <img src={g.image} alt="" className="h-12 w-12 object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#083b6c]">{g.name}</p>
                        <p className={cn("text-xs", soldOut ? "font-semibold text-destructive" : "text-muted-foreground")}>
                          {soldOut ? "Sold out" : `$${unit.toFixed(2)} each`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() =>
                            setCustomQty((q) => ({ ...q, [g.id]: Math.max(0, (q[g.id] ?? 0) - 1) }))
                          }
                        >
                          −
                        </Button>
                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-full p-0"
                          disabled={plusBlocked}
                          onClick={() =>
                            setCustomQty((q) => {
                              const next = { ...q, [g.id]: (q[g.id] ?? 0) + 1 };
                              if (!canSellCustomQty(next, serverPool, marketId)) return q;
                              return next;
                            })
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#083b6c]">Delivery location</h2>
            <p className="text-sm text-muted-foreground">
              We deliver to {MARKETS[marketId].serviceAreaLabel} in {MARKETS[marketId].name}.
            </p>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto">
              {checkoutSpots.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStreetName(opt.id)}
                  className={cn(
                    "flex w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold",
                    streetName === opt.id
                      ? "border-[#083b6c] bg-[#e6f9ff] text-[#083b6c]"
                      : "border-border bg-white",
                  )}
                >
                  {opt.displayName}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#083b6c]">Review & pay</h2>
            <div className="space-y-2 rounded-2xl border border-border bg-white p-4 text-sm">
              <p className="font-semibold text-[#083b6c]">
                {mode === "package" ? pkg.name : "Custom setup"} · {durationHours}h · ${gearMerchandise.toFixed(2)}
              </p>
              {mode === "package" ? (
                <ul className="space-y-0.5 text-muted-foreground">
                  {pkg.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-0.5 text-muted-foreground">
                  {Object.entries(customQty)
                    .filter(([, q]) => q > 0)
                    .map(([sku, q]) => {
                      const gear = CUSTOM_GEAR.find((g) => g.id === sku);
                      return (
                        <li key={sku}>
                          · {q}× {gear?.name ?? sku}
                        </li>
                      );
                    })}
                </ul>
              )}
              <p className="text-muted-foreground">
                {serviceDate ? format(serviceDate, "EEE, MMM d") : ""} · {startTime} – {endTime}
              </p>
              <p className="text-muted-foreground">{location?.displayName}</p>
              {includeFood ? (
                <div className="border-t pt-2">
                  <p className="font-semibold text-[#083b6c]">
                    {foodRestaurant?.name ?? "Food"} · ${foodSubtotal.toFixed(2)}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {foodLines.map((l) => (
                      <li key={l.key}>
                        {l.quantity}× {l.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input className="h-12 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input className="h-12 rounded-xl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            </div>
            <SmsConsentCheckbox id="booking-sms-consent" checked={smsConsent} onCheckedChange={setSmsConsent} />
            <div className="space-y-2">
              <Label>Notes for crew</Label>
              <Input className="h-12 rounded-xl" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
            </div>

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
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
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
              <p className="mb-2 text-sm font-medium">Crew tip</p>
              <div className="flex flex-wrap gap-2">
                {GEAR_TIP_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTip(amt)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold",
                      tip === amt ? "border-[#083b6c] bg-[#e6f9ff] text-[#083b6c]" : "border-border",
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-white p-4 text-sm">
              <div className="flex justify-between">
                <span>Gear</span>
                <span>${gearMerchandise.toFixed(2)}</span>
              </div>
              {includeFood && foodSubtotal > 0 ? (
                <div className="flex justify-between">
                  <span>Food</span>
                  <span>${foodSubtotal.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Gear delivery & setup</span>
                <span>${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              {foodDeliveryFee > 0 ? (
                <div className="flex justify-between">
                  <span>Food delivery</span>
                  <span>${foodDeliveryFee.toFixed(2)}</span>
                </div>
              ) : null}
              {onDemand > 0 ? (
                <div className="flex justify-between">
                  <span>On-demand</span>
                  <span>${onDemand.toFixed(2)}</span>
                </div>
              ) : null}
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

            <div className="rounded-2xl border border-border bg-white p-4">
              <StripeCardForm
                amountCents={Math.round(totals.orderTotalUsd * 100)}
                onReady={setStripeReady}
                registerConfirm={registerConfirm}
              />
            </div>
            <p className="text-xs text-muted-foreground">Free cancel before 8:00 AM {clockZone} on your service day.</p>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              className="flex-1 rounded-full bg-[#083b6c] hover:bg-[#0a4a85]"
              disabled={!canContinue()}
              onClick={() => setStep((s) => s + 1)}
            >
              {step === 2 && poolReady && !selectionAvailable ? "Sold out for this date" : "Continue"}
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 rounded-full bg-[#083b6c] hover:bg-[#0a4a85]"
              disabled={
                submitting ||
                !selectionAvailable ||
                !name.trim() ||
                !isValidContactPhone(phone) ||
                !smsConsent
              }
              onClick={() => void placeOrder()}
            >
              {submitting ? "Processing…" : `Confirm booking · $${totals.orderTotalUsd.toFixed(2)}`}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
