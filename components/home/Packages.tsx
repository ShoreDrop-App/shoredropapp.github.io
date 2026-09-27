"use client";

import Link from "next/link";
import { PACKAGES, getPackageStartingFrom } from "../../lib/ordering/catalog";
import { useFoodBagOptional } from "../../contexts/FoodBagContext";
import { Container, DisplayHeading, Eyebrow } from "./ui";

function splitQty(item: string) {
  const m = item.match(/^(\d+)\s+(.*)$/);
  return m ? { qty: m[1], label: m[2] } : { qty: "", label: item };
}

export default function Packages() {
  const foodBag = useFoodBagOptional();
  const foodCount = foodBag?.bagCount ?? 0;
  const foodTotal = foodBag?.subtotal ?? 0;

  return (
    <section id="packages" className="bg-sand-surface py-20 lg:py-24">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <Eyebrow>Packages</Eyebrow>
            <DisplayHeading className="max-w-[19ch] text-[2.6rem] sm:text-5xl lg:text-[3.5rem]">
              Pick a setup. We&apos;ll handle the rest.
            </DisplayHeading>
          </div>
          <p className="max-w-sm text-[17px] leading-relaxed text-ink-muted">
            Tiered pricing by time of day — half-day starting prices shown. Book online or in the app.
          </p>
        </div>

        {foodCount > 0 ? (
          <p className="mt-8 max-w-xl border-l-2 border-ochre bg-sand-bg px-4 py-3 text-sm text-ink">
            You have {foodCount} food item{foodCount === 1 ? "" : "s"} in your bag (${foodTotal.toFixed(2)}). Select a package
            below — food stays in your order through checkout.
          </p>
        ) : null}

        <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg, i) => {
            const from = getPackageStartingFrom(pkg.id);
            const href = `/booking?package=${pkg.id}`;
            return (
              <article key={pkg.id} className="group flex flex-col">
                <Link href={href} className="block overflow-hidden rounded-[4px] bg-sand" aria-label={`Book ${pkg.name}`}>
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <p className="mt-5 font-display text-sm italic text-ochre">No. 0{i + 1}</p>
                <h3 className="mt-1 font-display text-[1.75rem] font-normal leading-tight text-ink">{pkg.name}</h3>
                <p className="mt-2 min-h-[2.75rem] text-[15px] leading-snug text-ink-muted">{pkg.description}</p>

                <ul className="mt-5 border-t border-line">
                  {pkg.items.map((item) => {
                    const { qty, label } = splitQty(item);
                    return (
                      <li key={item} className="flex gap-4 border-b border-line py-2.5 text-sm text-ink">
                        <span className="w-4 tabular-nums text-ink-muted">{qty}</span>
                        <span>{label}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="flex items-baseline gap-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">From</span>
                    <span className="font-display text-[1.9rem] leading-none text-ink">${from.toFixed(2)}</span>
                  </p>
                  <Link
                    href={href}
                    className="rounded-[4px] bg-navy px-4 py-2.5 text-sm font-medium text-sand-surface transition-colors hover:bg-navy-deep"
                  >
                    Select
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
