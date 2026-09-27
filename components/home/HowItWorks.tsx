import { Container, DisplayHeading, Eyebrow } from "./ui";

const STEPS = [
  {
    title: "Reserve",
    body: "Book a package or custom setup in advance — or same-day on demand when slots remain.",
  },
  {
    title: "Choose your spot",
    body: "Pick Virginia Beach or Panama City Beach, then your street or beach access and setup time.",
  },
  {
    title: "Relax & order food",
    body: "Settle in, then order from local partners where available — delivered to your towel during food hours.",
  },
  {
    title: "We pack up",
    body: "When your rental ends, our crew packs everything so you can walk off the beach free.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pb-20 lg:pb-24">
      <Container>
        <div className="border-t border-ink/30 pt-12 lg:pt-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-5">
              <Eyebrow>How it works</Eyebrow>
              <DisplayHeading className="text-[2.6rem] sm:text-5xl lg:text-[3.5rem]">Your easiest beach day ever.</DisplayHeading>
            </div>
            <p className="max-w-sm text-[17px] leading-relaxed text-ink-muted">
              Four simple steps from reserve to pack-up — gear online, food when you&apos;re hungry.
            </p>
          </div>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-0">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="lg:border-l lg:border-line lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  className={`block font-display text-[4.5rem] font-normal leading-none tracking-[-0.03em] lg:text-[5rem] ${
                    i === 0 ? "text-ochre" : "text-ink"
                  }`}
                >
                  0{i + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl font-normal text-ink">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
