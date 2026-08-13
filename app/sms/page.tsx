import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import SmsConsentPreview from "../../components/SmsConsentPreview";

export const metadata: Metadata = {
  title: "SMS Messaging Consent",
  description:
    "How ShoreDrop collects consent for transactional order SMS, including opt-out and privacy details.",
  alternates: { canonical: "/sms" },
  openGraph: {
    title: "SMS Messaging Consent — ShoreDrop",
    description:
      "How ShoreDrop collects consent for transactional order SMS, including opt-out and privacy details.",
    url: "/sms",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ShoreDrop — Beach Day Delivery",
      },
    ],
  },
};

export default function SmsConsentPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-32">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-ocean-deep">SMS messaging consent</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last Updated: August 12, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            ShoreDrop LLC sends transactional SMS only for a guest&apos;s own order. We do not use this program for
            marketing or promotional texts.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">1. How customers opt in</h2>
            <p className="mb-2">
              Customers opt in when booking beach delivery or food on the ShoreDrop website (
              <Link href="/booking" className="font-medium text-ocean-deep underline underline-offset-2">
                shoredropapp.com/booking
              </Link>
              ) or in the ShoreDrop app. At checkout they enter their mobile number and check an unchecked box agreeing
              to receive transactional SMS from ShoreDrop about that order.
            </p>
            <p>
              Providing a phone number alone is not enough. The order cannot be placed until the SMS consent box is
              checked.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">2. Checkout call to action</h2>
            <p className="mb-3">
              This is the consent control shown next to the phone field on website and app checkout (unchecked by
              default):
            </p>
            <SmsConsentPreview />
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">3. What messages we send</h2>
            <ul className="mb-2 list-disc space-y-1 pl-5">
              <li>Order confirmation</li>
              <li>Delivery status: on the way, setting up, ready</li>
              <li>Two-way support chat for that order (including photos when needed)</li>
            </ul>
            <p>Message frequency varies by order. We do not send recurring promotional campaigns on this number.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">4. Required disclosures</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Message and data rates may apply.</li>
              <li>Reply STOP to opt out; HELP for help.</li>
              <li>
                Privacy Policy:{" "}
                <Link href="/privacy" className="font-medium text-ocean-deep underline underline-offset-2">
                  shoredropapp.com/privacy
                </Link>
              </li>
              <li>
                Terms:{" "}
                <Link href="/terms" className="font-medium text-ocean-deep underline underline-offset-2">
                  shoredropapp.com/terms
                </Link>
              </li>
              <li>Mobile numbers are not shared with third parties or affiliates for marketing or promotional purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">5. Sample messages</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>ShoreDrop: Your beach setup is confirmed for Sat 10:00 AM at 42nd St. Reply STOP to opt out, HELP for help.</li>
              <li>ShoreDrop: Crew is on the way to 42nd St. Reply STOP to opt out.</li>
              <li>ShoreDrop: Your setup is ready. Enjoy the beach! Reply STOP to opt out.</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
