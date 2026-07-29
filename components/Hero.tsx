"use client";

import Link from "next/link";
import { Button } from "./button";
import { ArrowRight, Star } from "lucide-react";

/** Homepage hero — ShoreDrop beach setup photo. */
const HERO_IMAGE = "/assets/hero-beach.jpg";

const BOTTOM_POINTS = [
  "42nd–86th Street coverage",
  "Setup before you arrive",
  "Local & family-run",
] as const;

const Hero = () => {
  return (
    <section className="flex min-h-[100svh] flex-col bg-hero-gradient pt-[4.25rem]">
      <div className="container mx-auto flex flex-1 flex-col justify-center px-4 py-5 lg:py-6">
        {/* First viewport: copy + image only — no scroll needed on desktop */}
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-10 xl:gap-14">
          <div className="flex flex-col justify-center gap-4 lg:gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#bbefff] bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-[#083b6c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82b6]" />
              Live in Virginia Beach · Summer 2026
            </span>

            <div className="space-y-3">
              <h1 className="font-serif max-w-[14ch] text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-[#083b6c] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
                Your Beach Day,
                <span className="block">Delivered.</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-[1.05rem]">
                Premium chairs, umbrellas, and gear — set up before you arrive and packed up after you leave.
                Plus meals from local favorites, delivered right to your spot.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[#083b6c] px-7 py-5 text-base text-white hover:bg-[#0a4a85]"
              >
                <Link href="/#services">Book Your Beach Day</Link>
              </Button>
              <button
                type="button"
                className="inline-flex items-center text-sm font-semibold text-[#083b6c] hover:underline"
                onClick={() => {
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See how it works
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Lovable-style horizontal dots row */}
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-[#083b6c]/85">
              {BOTTOM_POINTS.map((line) => (
                <li key={line} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3b82b6]" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.75rem] bg-[#bbefff]/35 blur-2xl lg:translate-x-3 lg:translate-y-3" />
            <div className="relative overflow-hidden rounded-[1.5rem] bg-white shadow-wave ring-1 ring-black/5 lg:rounded-[1.75rem]">
              <img
                src={HERO_IMAGE}
                alt="ShoreDrop beach setup with chairs, umbrella, and cooler"
                className="h-[min(52svh,28rem)] w-full object-cover object-[center_42%] sm:h-[min(56svh,32rem)] lg:h-[min(72svh,36rem)] xl:h-[min(74svh,38rem)]"
              />
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-3 py-2.5 shadow-soft backdrop-blur sm:bottom-4 sm:left-4 sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 sm:h-9 sm:w-9">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#083b6c]">4.9</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">Loved by beachgoers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
