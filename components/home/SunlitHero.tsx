import { Container, PrimaryButton, TextLink } from "./ui";

const TRUST_POINTS = [
  "Virginia Beach & Panama City Beach coverage",
  "Setup before you arrive",
  "Local & family-run",
] as const;

export default function SunlitHero() {
  return (
    <section className="pt-[4.5rem]">
      <Container className="grid gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="flex flex-col">
          <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ochre">
            <span aria-hidden className="h-px w-8 bg-ochre" />
            Live in Virginia Beach · Now serving Panama City Beach, FL
          </p>

          <h1 className="mt-7 font-display text-[2.6rem] font-normal leading-[0.98] min-[400px]:text-[2.9rem] tracking-[-0.025em] text-ink sm:text-[4.5rem] lg:text-[5.4rem] xl:text-[6rem]">
            Your Beach Day,
            <br />
            <em className="font-normal italic">Delivered.</em>
          </h1>

          <p className="mt-7 max-w-[34rem] text-[17px] leading-[1.6] text-ink-muted sm:text-lg">
            Premium chairs, umbrellas, and gear — set up before you arrive and packed up after you leave.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PrimaryButton href="/booking">Book your beach day</PrimaryButton>
            <TextLink href="/#packages">See packages</TextLink>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-3 lg:mt-auto lg:pt-16">
            {TRUST_POINTS.map((point, i) => (
              <li key={point} className="border-t border-ink/25 pt-3">
                <span className="font-display text-sm italic text-ochre">0{i + 1}</span>
                <p className="mt-1 text-sm leading-snug text-ink">{point}</p>
              </li>
            ))}
          </ol>
        </div>

        <figure className="flex flex-col">
          <div className="overflow-hidden rounded-[4px] bg-sand">
            <img
              src="/assets/hero-beach.jpg"
              alt="ShoreDrop beach setup with a blue umbrella, beach chair, and ShoreDrop cooler on the sand"
              className="aspect-[4/5] w-full object-cover object-center"
              fetchPriority="high"
            />
          </div>
          <figcaption className="mt-3 flex items-center justify-between gap-4 text-xs text-ink-muted">
            <span className="font-display italic">Umbrella, chair & cooler — set up before you arrive.</span>
            <span className="shrink-0 uppercase tracking-[0.14em]">Photo · ShoreDrop</span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
