import { FaApple } from "react-icons/fa";
import { IOS_APP_STORE_URL } from "../../lib/app-links";
import { Container, Eyebrow } from "./ui";

export default function AppBand() {
  return (
    <section id="app" className="bg-sand py-20 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-6">
          <Eyebrow>The ShoreDrop app</Eyebrow>
          <h2 className="font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.5rem]">
            Your beach day, <em className="italic">in your pocket.</em>
          </h2>
          <p className="max-w-lg text-[17px] leading-relaxed text-ink-muted">
            Browse packages or mix individual items, reserve your setup, follow your order, and add food where local
            partners participate.
          </p>
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-[8px] bg-black px-5 py-2.5 text-white transition-opacity hover:opacity-85"
          >
            <FaApple size={26} aria-hidden />
            <span className="flex flex-col leading-none">
              <span className="text-[10px] tracking-wide">Download on the</span>
              <span className="mt-0.5 text-lg font-semibold tracking-tight">App Store</span>
            </span>
          </a>
        </div>

        <figure>
          <div className="overflow-hidden rounded-[4px] bg-sand-surface">
            <img
              src="/assets/hero-shoredrop.png"
              alt="Two guests relaxing in ShoreDrop chairs under a blue umbrella with a cooler between them"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-bottom"
            />
          </div>
          <figcaption className="mt-3 font-display text-xs italic text-ink-muted">
            Reserve in the app — we&apos;ll have it set up when you arrive.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
