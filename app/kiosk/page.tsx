import type { Metadata } from "next";
import {
  Camera,
  Check,
  Clock,
  DollarSign,
  Mail,
  Palette,
  QrCode,
  ShieldCheck,
  Tablet,
  Umbrella,
  Users,
} from "lucide-react";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";

const PARTNERS_EMAIL = "partners@shoredropapp.com";

export const metadata: Metadata = {
  title: "Kiosk for Hotels",
  description:
    "ShoreDrop installs a beach-setup ordering kiosk in your lobby so guests can book chairs, umbrellas, and coolers on their way out the door. No app, no staff involvement, no upfront cost.",
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
    number: "01",
    title: "Guests tap to browse",
    body: "Chairs, umbrellas, coolers, and full-day packages — priced and pictured on the kiosk. No app download, no account, no front-desk questions.",
    icon: Tablet,
  },
  {
    number: "02",
    title: "They pay on their own phone",
    body: "A QR code moves checkout to the guest's phone in seconds. Card details never touch your lobby hardware or your staff.",
    icon: QrCode,
  },
  {
    number: "03",
    title: "We set up before they arrive",
    body: "Our crew places the gear on the sand ahead of the guest's arrival time and sends a photo confirmation straight to their phone.",
    icon: Umbrella,
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
    body: "Your hotel's name, logo, and colors on the screen. ShoreDrop stays quietly in the footer.",
    icon: Palette,
  },
];

const stats = [
  { value: "$0", label: "upfront cost", body: "Hardware, stand, and install are on us.", icon: DollarSign },
  { value: "< 1 week", label: "to go live", body: "Site visit, branding, delivery, done.", icon: Clock },
  {
    value: "100%",
    label: "commercially insured",
    body: "$2M general liability, certificate on file.",
    icon: ShieldCheck,
  },
];

export default function KioskPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto max-w-6xl px-4 pt-32 pb-20 space-y-16">
        <header className="mx-auto max-w-3xl space-y-5 text-center">
          <span className="inline-flex items-center rounded-full bg-[#eff7ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1d7bd8]">
            Hospitality technology
          </span>
          <h1 className="text-4xl font-light leading-tight text-ocean-deep md:text-5xl">
            The Amenity Your Guests Actually Use
          </h1>
          <p className="text-base text-muted-foreground">
            ShoreDrop installs a beach-setup ordering kiosk in your lobby, so guests can book chairs,
            umbrellas, and coolers on their way out the door — zero effort, no app, nothing for your
            team to manage.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${PARTNERS_EMAIL}?subject=ShoreDrop%20Kiosk%20Demo`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#083b6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#062a4d] sm:w-auto"
            >
              <Mail size={16} />
              Request a Demo
            </a>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center rounded-full border border-[#e7edf5] bg-white px-6 py-3 text-sm font-semibold text-ocean-deep hover:bg-[#f6fbff] sm:w-auto"
            >
              See How It Works
            </a>
          </div>
          <p className="text-xs text-[#7d9ab6]">
            Installed in oceanfront properties along the Gulf and Atlantic coasts.
          </p>
        </header>

        <section id="how-it-works" className="scroll-mt-28 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1d7bd8]">How it works</p>
            <h2 className="text-3xl font-light text-ocean-deep md:text-4xl">
              Three taps in the lobby. A finished setup on the sand.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.number}
                  className="flex flex-col rounded-2xl border border-[#e7edf5] bg-white p-6 shadow-[0_2px_10px_rgba(8,59,108,0.06)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff7ff] text-[#1d7bd8]">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold text-[#cbd9e7]">Step {step.number}</span>
                  </div>
                  <h3 className="text-xl font-medium leading-tight text-ocean-deep">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1d7bd8]">
              Built for property teams
            </p>
            <h2 className="text-3xl font-light text-ocean-deep md:text-4xl">
              An amenity that adds service, not headcount.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  className="flex flex-col rounded-2xl border border-[#e7edf5] bg-white p-6 shadow-[0_2px_10px_rgba(8,59,108,0.06)]"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#eff7ff] text-[#1d7bd8]">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-xl font-medium leading-tight text-ocean-deep">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.body}</p>
                </article>
              );
            })}
          </div>
          <p className="mx-auto max-w-3xl rounded-2xl border border-[#e7edf5] bg-[#f6fbff] px-5 py-4 text-center text-sm text-muted-foreground">
            <span className="font-medium text-ocean-deep">White-labeling detail.</span> Your property
            name, mark, and colors greet the guest. ShoreDrop stays in the footer.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e7edf5] bg-white px-5 py-6 text-center shadow-[0_1px_6px_rgba(8,59,108,0.05)]"
              >
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#eff7ff] text-[#1d7bd8]">
                  <Icon size={18} />
                </span>
                <p className="text-3xl font-light text-ocean-deep">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-ocean-deep">{stat.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stat.body}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[#e7edf5] bg-[#f6fbff] px-6 py-10 text-center shadow-[0_2px_10px_rgba(8,59,108,0.06)]">
          <h2 className="mx-auto max-w-2xl text-3xl font-light leading-tight text-ocean-deep md:text-4xl">
            Give your lobby something guests will actually use
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Fifteen minutes is enough to see the kiosk, the guest flow, and the install plan. We&apos;ll
            handle the rest.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${PARTNERS_EMAIL}?subject=ShoreDrop%20Kiosk%20Demo`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#083b6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#062a4d] sm:w-auto"
            >
              <Mail size={16} />
              Request a Demo
            </a>
            <a
              href={`mailto:${PARTNERS_EMAIL}`}
              className="text-sm font-medium text-[#1d7bd8] hover:text-[#083b6c]"
            >
              {PARTNERS_EMAIL}
            </a>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {["No upfront cost", "Live in under a week", "$2M liability coverage"].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#1d7bd8]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
