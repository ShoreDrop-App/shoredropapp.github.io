import type { Metadata } from "next";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import BlogIndexClient from "../../components/BlogIndexClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "ShoreDrop blog guides for better beach days in Virginia Beach and Panama City Beach — rentals, rules, parking, family tips, and more.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The ShoreDrop Blog — ShoreDrop",
    description:
      "Your guide to better beach days in Virginia Beach and Panama City Beach.",
    url: "/blog",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The ShoreDrop Blog",
      },
    ],
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto max-w-6xl px-4 pb-16 pt-32">
        <header className="mb-12 space-y-3 text-center">
          <h1 className="text-4xl font-light text-ocean-deep md:text-5xl">The ShoreDrop Blog</h1>
          <p className="text-base text-muted-foreground">
            Your guide to better beach days in Virginia Beach and Panama City Beach.
          </p>
        </header>

        <BlogIndexClient />

        <section className="mx-auto mt-12 max-w-3xl space-y-4 rounded-2xl border border-[#083b6c]/10 bg-[#e6f9ff]/50 p-6 text-center">
          <h2 className="text-3xl font-light text-ocean-deep">
            Get Virginia Beach and Panama City Beach tips delivered to your inbox.
          </h2>
          <form className="flex flex-col justify-center gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm sm:w-80"
              aria-label="Email"
            />
            <button
              type="submit"
              className="rounded-md bg-[#083b6c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#062a4d]"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
