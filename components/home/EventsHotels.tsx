import type { ReactNode } from "react";
import { Container, DisplayHeading, Eyebrow, TextLink } from "./ui";

function Feature({
  eyebrow,
  title,
  body,
  points,
  cta,
  href,
  media,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  cta: string;
  href: string;
  media: ReactNode;
}) {
  return (
    <article className="flex flex-col">
      {media}
      <div className="mt-8 space-y-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <DisplayHeading as="h3" className="max-w-[16ch] text-[2.2rem] sm:text-[2.6rem]">
          {title}
        </DisplayHeading>
        <p className="max-w-xl text-[16px] leading-relaxed text-ink-muted">{body}</p>
        <ul className="border-t border-line">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 border-b border-line py-3 text-sm text-ink">
              <span aria-hidden className="h-px w-3 bg-ochre" />
              {p}
            </li>
          ))}
        </ul>
        <div className="pt-2">
          <TextLink href={href}>{cta}</TextLink>
        </div>
      </div>
    </article>
  );
}

export default function EventsHotels() {
  return (
    <section id="events-hotels" className="py-20 lg:py-24">
      <Container className="grid gap-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-0">
        <div className="lg:pr-14">
          <Feature
            eyebrow="Private Events · Virginia Beach"
            title="Birthdays, weddings & team outings"
            body="From birthdays to weddings, ShoreDrop helps plan and coordinate private beach events in Virginia Beach."
            points={["Delivery & professional setup", "On-call host during event", "Food & drink coordination"]}
            cta="Plan an event"
            href="/private-events"
            media={
              <div className="overflow-hidden rounded-[4px] bg-sand">
                <img
                  src="/assets/packages/mega-drop.png"
                  alt="Two ShoreDrop tents with a row of beach chairs and coolers set up for a group"
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover object-[center_55%] lg:aspect-auto lg:h-[26rem]"
                />
              </div>
            }
          />
        </div>
        <div className="lg:border-l lg:border-line lg:pl-14">
          <Feature
            eyebrow="For Hotels"
            title="A beach-gear kiosk for your lobby"
            body="A lobby kiosk that turns beach gear into a five-star amenity. White-labeled to your property, installed at no upfront cost."
            points={["White-labeled to your brand", "Guests pay on their own phone", "We set up before they arrive"]}
            cta="Request a demo"
            href="/kiosk"
            media={
              <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[4px] border border-line bg-white lg:aspect-auto lg:h-[26rem]">
                <img
                  src="/assets/kiosk/kiosk-hero.png"
                  alt="ShoreDrop ordering kiosk on a stand"
                  loading="lazy"
                  className="h-[88%] w-auto object-contain"
                />
              </div>
            }
          />
        </div>
      </Container>
    </section>
  );
}
