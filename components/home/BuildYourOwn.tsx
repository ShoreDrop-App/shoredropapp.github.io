import Link from "next/link";
import { CUSTOM_GEAR, CUSTOM_MIN_SUBTOTAL_USD } from "../../lib/ordering/catalog";
import { Container, DisplayHeading, Eyebrow, PrimaryButton } from "./ui";

export default function BuildYourOwn() {
  return (
    <section id="build-your-own" className="py-20 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-24">
        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-5">
            <Eyebrow>Build your own</Eyebrow>
            <DisplayHeading className="text-[2.6rem] sm:text-5xl lg:text-[3.5rem]">Mix & match gear</DisplayHeading>
            <p className="text-[15px] text-ink-muted">Half-day starting prices shown.</p>
          </div>
          <div className="space-y-5">
            <div className="rounded-[4px] bg-sand px-7 py-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ochre">Custom minimum</p>
              <p className="mt-2 font-display text-[2.6rem] leading-none text-ink">${CUSTOM_MIN_SUBTOTAL_USD.toFixed(2)}</p>
              <p className="mt-3 text-[15px] text-ink-muted">Full & shore day priced higher at checkout.</p>
            </div>
            <PrimaryButton href="/booking?custom=beach-chair">Build a custom setup</PrimaryButton>
          </div>
        </div>

        <ul className="border-y border-ink/40">
          {CUSTOM_GEAR.map((item, i) => (
            <li key={item.id} className="border-b border-line last:border-b-0">
              <Link
                href={`/booking?custom=${item.id}`}
                className="group flex items-center gap-4 py-4 sm:gap-6"
                aria-label={`Add ${item.name}, $${item.price.toFixed(2)}`}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-[4px] object-cover sm:h-16 sm:w-16"
                />
                <span className="hidden font-display text-sm italic text-ochre sm:inline">0{i + 1}</span>
                <span className="font-display text-xl text-ink transition-colors group-hover:text-navy sm:text-2xl">
                  {item.name}
                </span>
                <span aria-hidden className="mx-1 hidden flex-1 border-b border-dotted border-ink/30 sm:block" />
                <span className="ml-auto font-display text-xl text-ink sm:ml-0">${item.price.toFixed(2)}</span>
                <span
                  aria-hidden
                  className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-ochre opacity-0 transition-opacity group-hover:opacity-100 lg:inline"
                >
                  Add
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
