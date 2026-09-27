import { Instagram, Linkedin, Facebook } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { IOS_APP_STORE_URL } from "../lib/app-links";

type FooterLink = { href: string; label: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { href: "/#services", label: "Book gear" },
      { href: "/food", label: "Food & Drinks" },
      { href: "/private-events", label: "Private Events" },
      { href: "/mission", label: "Our mission" },
      { href: "/blog", label: "Blog" },
      { href: "/app", label: "Mobile app" },
      { href: "/kiosk", label: "Kiosk for hotels" },
      { href: IOS_APP_STORE_URL, label: "Get the app", external: true },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Help Center" },
      { href: "/support", label: "Contact Us" },
      { href: "#", label: "Partners" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/sms", label: "SMS consent" },
      { href: "/delete-account", label: "Delete account" },
      { href: "/terms", label: "Terms" },
      { href: "/cancellation", label: "Cancellation" },
      { href: "/rental-policy", label: "Rental policy" },
      { href: "/liability-waiver", label: "Liability waiver" },
    ],
  },
];

const SOCIALS = [
  { href: "https://www.instagram.com/shoredropapp", label: "ShoreDrop on Instagram", Icon: Instagram },
  { href: "https://www.facebook.com/share/1HH6Ak5ptN/?mibextid=LQQJ4d", label: "ShoreDrop on Facebook", Icon: Facebook },
  { href: "https://www.tiktok.com/@shoredrop?_r=1&_t=ZT-945pDzsERR8", label: "ShoreDrop on TikTok", Icon: FaTiktok },
  { href: "https://www.linkedin.com/company/shoredrop/", label: "ShoreDrop on LinkedIn", Icon: Linkedin },
] as const;

const SiteFooter = () => {
  return (
    <footer className="border-t border-line bg-sand-bg pb-10 pt-16 lg:pt-20">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/assets/logo-mark.png" alt="" className="h-10 w-auto" />
              <span className="font-display text-[1.75rem] leading-none text-ink">ShoreDrop</span>
            </a>
            <p className="max-w-xs font-display text-lg italic leading-snug text-ink">
              Premium and Affordable Beach Experiences Delivered with Care and Precision.
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ochre">
              Virginia Beach, VA · Panama City Beach, FL
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">{col.title}</h4>
              <ul className="mt-5 space-y-3 text-[15px] text-ink">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="transition-colors hover:text-ochre"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-line pt-7 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-muted">© {new Date().getFullYear()} ShoreDrop. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Follow us</span>
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink transition-colors hover:text-ochre"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
