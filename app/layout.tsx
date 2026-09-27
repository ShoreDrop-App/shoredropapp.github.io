import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "../components/Providers";
import { SUPPORT_EMAIL, SUPPORT_PHONE_TEL } from "../lib/contact";
import { SITE_URL } from "../lib/site-url";
import "./globals.css";

/** Sunlit Editorial: Newsreader (display serif), DM Sans (UI + body). */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShoreDrop — Beach Day Delivery",
    template: "%s — ShoreDrop",
  },
  description:
    "On-demand delivery of beach essentials — chairs, umbrellas, coolers, snacks, and drinks. ShoreDrop brings beach-day comforts to your towel.",
  keywords: [
    "beach delivery",
    "beach chair rental",
    "umbrella rental",
    "on-demand beach gear",
    "ShoreDrop",
    "Virginia Beach delivery",
    "Panama City Beach delivery",
    "Panama City Beach Florida",
  ],
  authors: [{ name: "ShoreDrop LLC" }],
  openGraph: {
    type: "website",
    siteName: "ShoreDrop",
    title: "ShoreDrop — Beach Day Delivery",
    description:
      "On-demand delivery of beach essentials — chairs, umbrellas, coolers, snacks.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShoreDrop — Beach Day Delivery",
    description:
      "On-demand delivery of beach essentials — chairs, umbrellas, coolers, snacks.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ShoreDrop",
    legalName: "ShoreDrop LLC",
    description:
      "On-demand delivery of beach essentials — chairs, umbrellas, coolers, snacks, and drinks.",
    url: SITE_URL,
    email: SUPPORT_EMAIL,
    telephone: SUPPORT_PHONE_TEL,
    areaServed: "US",
    sameAs: [
      "https://www.instagram.com/shoredropapp",
      "https://www.facebook.com/share/1HH6Ak5ptN/?mibextid=LQQJ4d",
      "https://www.tiktok.com/@shoredrop",
      "https://www.linkedin.com/company/shoredrop/",
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
