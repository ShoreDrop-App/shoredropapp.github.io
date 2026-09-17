"use client";

import { useEffect, useState } from "react";
import { fetchFoodOrderingStatus } from "../../lib/services/foodOrderingEnabled";

/** Surfaces the app staff food kill switch on website food pages. */
export default function FoodOrderingGateBanner() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchFoodOrderingStatus().then((status) => {
      if (cancelled || !status.known) return;
      setPaused(!status.enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!paused) return null;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950">
      Food ordering is paused right now. You can still browse the menu — checkout is blocked until we turn it back on.
    </div>
  );
}
