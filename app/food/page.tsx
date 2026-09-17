import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import FoodOrderingGateBanner from "../../components/food/FoodOrderingGateBanner";
import { FOOD_RESTAURANTS, FOOD_SCHEDULE_LABEL } from "../../lib/ordering/catalog";

export const metadata: Metadata = {
  title: "Food & Drinks — ShoreDrop",
  description: "Order from Waterman's — delivered to your beach setup in Virginia Beach (not yet in Panama City Beach).",
  alternates: { canonical: "/food" },
};

export default function FoodPage() {
  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <span className="inline-flex rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#083b6c]">
          New · Local partners
        </span>
        <h1 className="mt-4 text-4xl font-semibold text-[#083b6c]">Beach Bites, delivered to your setup.</h1>
        <p className="mt-2 text-muted-foreground">
          Ordering open {FOOD_SCHEDULE_LABEL}. Virginia Beach only for now — Panama City Beach food is coming soon.
        </p>
        <div className="mt-4">
          <FoodOrderingGateBanner />
        </div>
        <p className="mt-3 text-sm text-[#083b6c]/80">
          Add food to your bag, then add{" "}
          <Link href="/#services" className="font-semibold underline underline-offset-2">
            beach packages
          </Link>{" "}
          and checkout together — or order food alone.
        </p>

        <div className="mt-8 space-y-4">
          {FOOD_RESTAURANTS.map((r) => (
            <Link
              key={r.id}
              href={`/food/${r.id}`}
              className="flex overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition hover:shadow-wave"
            >
              <img src={r.heroImage} alt="" className="h-36 w-36 shrink-0 object-cover sm:h-40 sm:w-44" />
              <div className="flex flex-1 flex-col justify-center p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#083b6c]">{r.name}</h2>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {r.rating}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.cuisine}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.etaLabel} · Min ${r.minimumOrder.toFixed(2)} · Delivery ${r.deliveryFee.toFixed(2)}
                </p>
                <p className="mt-2 text-sm font-medium text-[#3b82b6]">{r.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
