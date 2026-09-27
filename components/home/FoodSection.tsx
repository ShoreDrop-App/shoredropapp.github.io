import Link from "next/link";
import { Container, Eyebrow } from "./ui";

export default function FoodSection() {
  return (
    <section id="food" className="bg-navy py-20 text-sand-surface lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <figure className="grid grid-cols-[1.35fr_1fr] items-end gap-4">
          <img
            src="/assets/food/food-chicken-sandwich.jpg"
            alt="Chicken sandwich from a local partner"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-[4px] object-cover"
          />
          <div className="flex flex-col gap-3">
            <img
              src="/assets/food/food-beach-burger.jpg"
              alt="Burger from a local partner"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[4px] object-cover"
            />
            <figcaption className="font-display text-xs italic text-sand-surface/70">From local partners, to your towel.</figcaption>
          </div>
        </figure>

        <div className="space-y-6">
          <Eyebrow tone="light">Food & Drinks · Virginia Beach</Eyebrow>
          <h2 className="font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.02em] text-sand-surface sm:text-5xl lg:text-[3.5rem]">
            Beach Bites, delivered to your setup.
          </h2>
          <p className="max-w-lg text-[17px] leading-relaxed text-sand-surface/85">
            Settle in, then order from local partners — delivered to your towel during food hours.
          </p>
          <p className="max-w-lg border-t border-sand-surface/25 pt-5 font-display text-[15px] italic leading-relaxed text-sand-surface/75">
            Order from Waterman&apos;s — delivered to your beach setup in Virginia Beach (not yet in Panama City Beach).
          </p>
          <Link
            href="/food"
            className="inline-flex items-center justify-center rounded-[4px] bg-sand-surface px-6 py-3.5 text-[15px] font-medium text-navy transition-colors hover:bg-sand"
          >
            See the menu
          </Link>
        </div>
      </Container>
    </section>
  );
}
