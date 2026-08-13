import type { Metadata } from "next";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "../../lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your access to and use of the ShoreDrop website, mobile app, and delivery services.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — ShoreDrop",
    description:
      "The terms that govern your access to and use of the ShoreDrop website, mobile app, and delivery services.",
    url: "/terms",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-ocean-deep">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: August 13, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Welcome to ShoreDrop. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the ShoreDrop website, mobile application, and related services (collectively, the &quot;Service&quot;).
            By accessing or using the Service, you agree to be bound by these Terms.
          </p>
          <p className="font-medium text-foreground">IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.</p>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">1. About ShoreDrop</h2>
            <p className="mb-2">
              ShoreDrop LLC (&quot;ShoreDrop,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a technology platform that facilitates on-demand delivery of beach-related goods and services, including but not limited to chairs, umbrellas, coolers, snacks, drinks, and rental equipment.
            </p>
            <p className="mb-2">
              Services may be fulfilled directly by ShoreDrop or by independent third-party vendors, merchants, or delivery providers. ShoreDrop acts solely as a delivery facilitator for third-party food vendors and is not responsible for food preparation, ingredient disclosures, or restaurant operations.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old to use the Service.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">3. User Accounts</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Accept responsibility for all activity under your account</li>
            </ul>
            <p>
              ShoreDrop reserves the right to suspend or terminate accounts or refuse service at its sole discretion, including for suspected fraud, misuse, or violations of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">4. Orders, Delivery &amp; Location Responsibility</h2>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>All orders are subject to availability and service area limitations</li>
              <li>Delivery times are estimates and are not guaranteed</li>
              <li>Service availability may vary by geographic location and may change at any time</li>
              <li>Delays may occur due to weather, traffic, beach conditions, or safety concerns</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">You are solely responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Providing an accurate and accessible delivery location (including GPS pin or clear description)</li>
              <li>Being present and available to receive delivery</li>
            </ul>
            <p className="mb-2">
              ShoreDrop may confirm delivery through photo verification, GPS timestamp, or other in-app confirmation methods. Such confirmation shall constitute proof of delivery.
            </p>
            <p className="mb-2">
              Risk of loss transfers to you upon confirmed delivery. ShoreDrop is not responsible for lost or stolen items after delivery has been completed.
            </p>
            <p>
              If delivery cannot be completed due to inaccurate information, unsafe conditions, or your unavailability, the order may be canceled without refund.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">5. Pricing &amp; Payment Authorization</h2>
            <p className="mb-2">Prices, taxes, fees, and delivery charges are displayed at checkout and may vary.</p>
            <p className="mb-2">By placing an order, you:</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Authorize ShoreDrop to charge your selected payment method</li>
              <li>
                Authorize additional charges for:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Damaged or lost items</li>
                  <li>Unreturned rental equipment</li>
                  <li>Extended rental time</li>
                  <li>Retrieval issues or failed pickup attempts</li>
                </ul>
              </li>
            </ul>
            <p>All sales are final except as required by law or as stated in these Terms.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">6. Cancellations &amp; Refunds</h2>
            <p className="mb-2">Orders may not be canceled once preparation or delivery has begun.</p>
            <p className="mb-2">
              Refunds, credits, or replacements may be issued at ShoreDrop&apos;s discretion and in compliance with applicable law, including in cases of:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Incorrect items</li>
              <li>Damaged or defective items</li>
              <li>Failure to deliver</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">7. Third-Party Providers (Independent Contractors)</h2>
            <p className="mb-2">
              ShoreDrop may engage independent third-party vendors, merchants, and delivery providers. These parties are independent contractors and are not employees, agents, or representatives of ShoreDrop.
            </p>
            <p className="mb-2">To the fullest extent permitted by law, ShoreDrop:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Does not control or supervise third-party providers</li>
              <li>Is not responsible for their conduct, negligence, or compliance with law</li>
              <li>Disclaims liability for any acts or omissions of third-party providers</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">8. Equipment Use, Assumption of Risk &amp; Liability Waiver</h2>
            <p className="mb-2">Use of beach equipment involves inherent risks, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Wind-related movement or tipping</li>
              <li>Uneven terrain</li>
              <li>Water exposure</li>
              <li>Normal wear and tear</li>
            </ul>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Use all equipment safely and as intended</li>
              <li>Inspect items upon delivery</li>
              <li>Discontinue use if any item appears unsafe</li>
            </ul>
            <p className="mb-3">
              ShoreDrop does not guarantee the stability, performance, or safety of equipment due to environmental conditions such as wind, sand movement, or improper use.
            </p>
            <p className="mb-2 font-medium text-foreground uppercase">
              To the fullest extent permitted by Virginia law, you expressly assume all risks associated with use of the Service and equipment.
              You hereby release, waive, and discharge ShoreDrop LLC, its members, officers, employees, and agents from any and all liability, including liability arising from negligence, for any injury, death, loss, or damage resulting from use of the Service or equipment.
            </p>
            <p>Your use of the Service is entirely at your own risk.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">9. Equipment Condition, Loss &amp; Damage</h2>
            <p className="mb-2">All equipment is provided on an &quot;as available&quot; basis and may show normal wear.</p>
            <p className="mb-2 font-medium text-foreground">You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Proper use and care</li>
              <li>Preventing loss, theft, or damage</li>
            </ul>
            <p className="mb-2">ShoreDrop reserves the right to charge you for:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Lost or stolen items</li>
              <li>Damage beyond normal wear</li>
              <li>Failure to return rental equipment</li>
            </ul>
            <p>
              If ShoreDrop is unable to retrieve rental equipment due to user absence or inaccessible location, additional fees may apply.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">10. Prohibited Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for unlawful purposes</li>
              <li>Interfere with the Service&apos;s operation or security</li>
              <li>Misuse, damage, or steal equipment</li>
              <li>Attempt to exploit or reverse engineer the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">11. Commercial Use Restriction</h2>
            <p>
              You may not resell, rent, sublicense, or use any equipment or items provided by ShoreDrop for commercial purposes without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">12. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and materials are the property of ShoreDrop LLC and may not be used without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">13. Disclaimer of Warranties</h2>
            <p className="mb-2 font-medium text-foreground">THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot;</p>
            <p className="mb-2">
              To the fullest extent permitted by Virginia law, ShoreDrop disclaims all warranties, express or implied, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">14. Limitation of Liability</h2>
            <p className="mb-2">To the fullest extent permitted by law:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>ShoreDrop shall not be liable for any indirect, incidental, special, or consequential damages</li>
              <li>ShoreDrop&apos;s total liability shall not exceed the amount paid for the applicable order</li>
            </ul>
            <p className="mt-2">This limitation applies regardless of the legal theory asserted.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">15. Indemnification</h2>
            <p className="mb-2">
              You agree to indemnify and hold harmless ShoreDrop LLC and its affiliates from any claims, damages, or expenses arising out of:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your misuse of equipment</li>
              <li>Your violation of applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">16. Force Majeure</h2>
            <p className="mb-2">
              ShoreDrop shall not be liable for any failure or delay caused by events beyond its reasonable control, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Weather conditions</li>
              <li>Natural disasters</li>
              <li>Government actions</li>
              <li>Labor shortages</li>
              <li>Transportation disruptions</li>
            </ul>
            <p>
              ShoreDrop reserves the right to cancel, delay, or modify orders due to unsafe conditions. Refunds or credits may be issued at ShoreDrop&apos;s discretion.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">17. Dispute Resolution &amp; Arbitration</h2>
            <p className="mb-2">
              All disputes shall be resolved through binding arbitration on an individual basis.
            </p>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Waive the right to a jury trial</li>
              <li>Waive participation in class actions</li>
            </ul>
            <p>
              Arbitration shall be administered under the rules of the American Arbitration Association (AAA) and conducted in the Commonwealth of Virginia.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">18. Governing Law</h2>
            <p>These Terms are governed by the laws of the Commonwealth of Virginia.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">19. Severability</h2>
            <p>
              If any provision of these Terms is found unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">20. Entire Agreement</h2>
            <p>
              These Terms constitute the entire agreement between you and ShoreDrop regarding use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">21. Changes to Terms</h2>
            <p>
              ShoreDrop may update these Terms at any time. Continued use of the Service constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">22. Chargebacks &amp; Payment Disputes</h2>
            <p className="mb-2">
              You agree to contact ShoreDrop to resolve any issue before initiating a chargeback. Fraudulent or abusive chargebacks may result in:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account suspension or termination</li>
              <li>Additional fees or collection efforts</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">23. Communications Consent</h2>
            <p className="mb-2">
              <span className="font-medium text-foreground">Program:</span> ShoreDrop transactional order SMS. After you
              provide your mobile number at checkout and check the SMS consent box, ShoreDrop may text you about that
              order only (confirmation, delivery status, and two-way support chat).
            </p>
            <p className="mb-2">
              Message frequency varies by order. Message and data rates may apply. Reply <strong>STOP</strong> to opt
              out. Reply <strong>HELP</strong> for help. Support: {SUPPORT_EMAIL} or{" "}
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="text-ocean-deep font-medium underline underline-offset-2"
              >
                {SUPPORT_PHONE}
              </a>
              . Details:{" "}
              <a href="/sms" className="text-ocean-deep font-medium underline underline-offset-2">
                shoredropapp.com/sms
              </a>
              .
            </p>
            <p>You may also receive transactional email and in-app notifications related to your order.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-foreground mb-2">24. Contact Information</h2>
            <p className="mb-1">📧 {SUPPORT_EMAIL}</p>
            <p className="mb-1">
              📞{" "}
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="text-ocean-deep font-medium underline underline-offset-2 hover:text-ocean-light transition-colors"
              >
                {SUPPORT_PHONE}
              </a>
            </p>
            <p>🌐 www.shoredropapp.com</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
