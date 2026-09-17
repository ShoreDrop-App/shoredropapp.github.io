"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../button";
import SiteNav from "../SiteNav";
import FoodOrderingGateBanner from "./FoodOrderingGateBanner";
import { getFoodRestaurant } from "../../lib/ordering/catalog";
import { useFoodBag } from "../../contexts/FoodBagContext";
import { fetchFoodOrderingStatus } from "../../lib/services/foodOrderingEnabled";
import { toast } from "sonner";

export default function FoodMenuClient({ restaurantId }: { restaurantId: string }) {
  const restaurant = getFoodRestaurant(restaurantId);
  const { lines, addLine } = useFoodBag();
  const [cheeseByItem, setCheeseByItem] = useState<Record<string, string>>({});
  const [foodOrderingEnabled, setFoodOrderingEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchFoodOrderingStatus().then((status) => {
      if (cancelled || !status.known) return;
      setFoodOrderingEnabled(status.enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bagCount = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);
  const bagForRestaurant = useMemo(
    () => lines.filter((l) => l.restaurantId === restaurant?.id),
    [lines, restaurant?.id],
  );
  const bagSubtotal = bagForRestaurant.reduce((s, l) => s + l.price * l.quantity, 0);

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 pt-28">
        <SiteNav />
        <p>Restaurant not found.</p>
        <Link href="/food" className="text-[#3b82b6] underline">
          Back to food
        </Link>
      </div>
    );
  }

  const sections = Array.from(new Set(restaurant.menu.map((m) => m.section)));

  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)] pb-32">
      <SiteNav />

      {/* Hero sits below fixed site nav so nothing is clipped */}
      <div className="relative mt-[4.5rem] h-52 overflow-hidden bg-[#083b6c] sm:h-64">
        <img src={restaurant.heroImage} alt="" className="h-full w-full object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-4 -mt-10">
        <div className="rounded-3xl bg-white p-5 shadow-wave">
          <div className="flex items-start gap-3">
            <img src={restaurant.logoImage} alt="" className="h-14 w-14 rounded-xl object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-[#083b6c]">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">
                {restaurant.etaLabel} · Min ${restaurant.minimumOrder.toFixed(2)}
              </p>
              <Link href="/food" className="mt-1 inline-block text-xs font-semibold text-[#3b82b6] hover:underline">
                ← All food partners
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FoodOrderingGateBanner />
        </div>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="mb-3 text-lg font-bold text-[#083b6c]">{section}</h2>
              <div className="space-y-3">
                {restaurant.menu
                  .filter((m) => m.section === section)
                  .map((item) => {
                    const cheeseOpt = item.options?.find((o) => o.id === "cheese");
                    const cheese = cheeseByItem[item.id] ?? cheeseOpt?.choices[0]?.id ?? "";
                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-2xl border border-border bg-white p-3 shadow-soft"
                      >
                        <img src={item.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#083b6c]">{item.name}</p>
                              {item.description ? (
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              ) : null}
                            </div>
                            <p className="shrink-0 font-bold text-[#083b6c]">${item.price.toFixed(2)}</p>
                          </div>
                          {cheeseOpt ? (
                            <select
                              className="mt-2 w-full rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-sm"
                              value={cheese}
                              onChange={(e) =>
                                setCheeseByItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                            >
                              {cheeseOpt.choices.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          ) : null}
                          <Button
                            size="sm"
                            className="mt-2 rounded-full bg-[#083b6c]"
                            disabled={!foodOrderingEnabled}
                            onClick={() => {
                              if (!foodOrderingEnabled) {
                                toast.error("Food ordering is paused right now.");
                                return;
                              }
                              if (cheeseOpt && !cheese) {
                                toast.error("Pick a cheese.");
                                return;
                              }
                              const cheeseLabel = cheeseOpt?.choices.find((c) => c.id === cheese)?.label;
                              const key = `${item.id}:${cheese || "plain"}`;
                              addLine({
                                key,
                                menuItemId: item.id,
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name,
                                name: cheeseLabel ? `${item.name} (${cheeseLabel})` : item.name,
                                price: item.price,
                                image: item.image,
                                optionLabel: cheeseLabel,
                              });
                              toast.success("Added to bag");
                            }}
                          >
                            + Add
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {bagCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#083b6c]">
                {bagCount} items · ${bagSubtotal.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                + ${restaurant.deliveryFee.toFixed(2)} food delivery at checkout
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full border-[#083b6c] text-[#083b6c]">
                <Link href="/#services">Add packages</Link>
              </Button>
              <Button asChild className="rounded-full bg-[#083b6c] px-6">
                <Link href="/food/checkout">View bag</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
