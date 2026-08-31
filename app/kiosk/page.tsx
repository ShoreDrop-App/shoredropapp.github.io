import type { Metadata } from "next";
import { Building2, Camera, Hand, QrCode, Sun, Users } from "lucide-react";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_DISPLAY } from "../../lib/contact";

export const metadata: Metadata = {
  title: "Kiosk for Hotels",
  description:
    "ShoreDrop installs a beach-setup ordering kiosk in your lobby, so guests can book chairs, umbrellas and coolers on their way out the door — zero effort, no app, nothing for your team to manage.",
  alternates: { canonical: "/kiosk" },
  openGraph: {
    title: "ShoreDrop Kiosk — The Amenity Your Guests Actually Use",
    description:
      "A lobby kiosk that turns beach gear into a five-star amenity. White-labeled to your property, installed at no upfront cost.",
    url: "/kiosk",
  },
};

const steps = [
  {
    step: "Step 01",
    title: "Guests tap to browse",
    body: "Chairs, umbrellas, coolers and full-day packages, priced and pictured on the kiosk. No app download, no account, no front-desk questions.",
    icon: Hand,
  },
  {
    step: "Step 02",
    title: "They pay on their own phone",
    body: "A QR code moves checkout to the guest's phone in seconds. Card details never touch your lobby hardware or your staff.",
    icon: QrCode,
  },
  {
    step: "Step 03",
    title: "We set up before they arrive",
    body: "Our crew places the gear on the sand ahead of the guest's arrival time and sends a photo confirmation straight to their phone.",
    icon: Sun,
  },
];

const benefits = [
  {
    title: "Zero staff involvement",
    body: "No training, no inventory, no extra work at the desk. The kiosk answers the question your team gets asked all day.",
    icon: Users,
  },
  {
    title: "A five-star amenity that photographs well",
    body: "Matching chairs, clean umbrellas, styled setups. It shows up in guest photos and in your reviews.",
    icon: Camera,
  },
  {
    title: "White-labeled to your brand",
    body: "Your hotel's name, logo and colors on the screen. ShoreDrop stays quietly in the footer.",
    icon: Building2,
  },
];

const stats = [
  { value: "$0", label: "upfront cost", body: "Hardware, stand and install are on us." },
  { value: "< 1 week", label: "to go live", body: "Site visit, branding, delivery, done." },
  { value: "100%", label: "commercially insured", body: "$2M general liability, certificate on file." },
];

export default function KioskPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[#eff7ff]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#083b6c]/10 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d7bd8]">
              Hospitality technology
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-tight text-ocean-deep sm:text-5xl lg:text-[3.65rem]">
              The Amenity Your Guests Actually Use
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              ShoreDrop installs a beach-setup ordering kiosk in your lobby, so guests can book chairs,
              umbrellas and coolers on their way out the door — zero effort, no app, nothing for your
              team to manage.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a
                href="#demo"
                className="rounded-full bg-[#1d7bd8] px-7 py-3.5 text-base font-semibold text-white shadow-[0_2px_10px_rgba(8,59,108,0.06)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Request a Demo
              </a>
              <a
                href="#how-it-works"
                className="border-b border-[#083b6c]/25 pb-0.5 text-base font-medium text-ocean-deep transition-colors hover:border-[#083b6c] hover:text-[#1d7bd8]"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Installed in oceanfront properties along the Gulf and Atlantic coasts.
            </p>
          </div>
          <div className="group relative flex justify-center [perspective:1400px]">
            <div className="absolute bottom-10 h-56 w-56 rounded-full bg-[#bbefff]/60 blur-3xl" />
            <img
              src="/assets/kiosk/kiosk-hero.png"
              alt="iPad kiosk on a floor stand showing the ShoreDrop home screen welcoming Embassy Suites PCB guests with an Order Your Setup button"
              width={1200}
              height={1408}
              className="relative w-full max-w-[420px] drop-shadow-[0_50px_60px_rgba(13,43,78,0.28)] transition-transform duration-700 ease-out will-change-transform [transform:rotateY(-9deg)_rotateX(2deg)] group-hover:[transform:rotateY(-2deg)_rotateX(0deg)_translateY(-10px)]"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1d7bd8]">How it works</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ocean-deep sm:text-4xl">
          Three taps in the lobby. A finished setup on the sand.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-3xl border border-[#e7edf5] bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_10px_rgba(8,59,108,0.06)]"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#eff7ff] text-[#1d7bd8]">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {item.step}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-ocean-deep">{item.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#eff7ff] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1d7bd8]">
                Built for property teams
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ocean-deep sm:text-4xl">
                An amenity that adds service, not headcount.
              </h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={benefit.title}
                      className="rounded-3xl bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_10px_rgba(8,59,108,0.06)]"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#e6f9ff] text-[#1d7bd8]">
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-5 text-base font-semibold leading-snug text-ocean-deep">
                        {benefit.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <figure className="rounded-[2rem] border border-[#083b6c]/10 bg-white p-6 shadow-[0_2px_10px_rgba(8,59,108,0.06)]">
              <img
                src="/assets/kiosk/kiosk-whitelabel.png"
                alt="Kiosk home screen co-branded for Embassy Suites PCB with a welcome hero, delivery location and a resort-guest discount"
                loading="lazy"
                width={1044}
                height={1870}
                className="mx-auto w-full max-w-[340px] rounded-2xl border border-[#e7edf5] transition-transform duration-500 hover:scale-[1.02]"
              />
              <figcaption className="mt-5 text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-ocean-deep">White-labeling detail.</span> Your property
                name, mark and colors greet the guest. ShoreDrop stays in the footer.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 border-y border-[#e7edf5] py-14 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-serif text-5xl font-semibold tracking-tight text-ocean-deep">{stat.value}</p>
              <p className="mt-2 text-base font-semibold text-[#1d7bd8]">{stat.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 bg-ocean-deep">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="inline-block h-1 w-14 rounded-full bg-amber-400" />
          <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.75rem]">
            Give your lobby something guests will actually use
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
            Fifteen minutes is enough to see the kiosk, the guest flow and the install plan. We&apos;ll
            handle the rest.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=ShoreDrop%20Kiosk%20Demo`}
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-ocean-deep shadow-[0_18px_40px_rgba(4,26,48,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#e6f9ff]"
            >
              Request a Demo
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-medium text-[#bbefff] transition-opacity hover:opacity-80"
            >
              {SUPPORT_EMAIL_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
