import type { Metadata } from "next";
import { Suspense } from "react";
import BookingClient from "../../components/booking/BookingClient";

export const metadata: Metadata = {
  title: "Book Your Beach Day — ShoreDrop",
  description: "Reserve beach gear delivery in Virginia Beach or Panama City Beach. Packages, custom setups, and same-day on-demand.",
  alternates: { canonical: "/booking" },
};

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading checkout…</div>}>
      <BookingClient />
    </Suspense>
  );
}
