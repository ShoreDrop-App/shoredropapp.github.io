import type { Metadata } from "next";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import BlogIndexClient from "../../components/BlogIndexClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "ShoreDrop blog articles on Virginia Beach tips, beach setup planning, and food delivery at the beach.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The ShoreDrop Blog — ShoreDrop",
    description:
      "Virginia Beach beach-day tips and practical guides from the ShoreDrop team.",
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
      <main className="container mx-auto px-4 pt-32 pb-16 max-w-6xl">
        <header className="text-center mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-light text-ocean-deep">The ShoreDrop Blog</h1>
          <p className="text-base text-muted-foreground">
            Your guide to the best beach days in Virginia Beach.
          </p>
        </header>

        <BlogIndexClient />

        <section className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[#083b6c]/10 bg-[#e6f9ff]/50 p-6 text-center space-y-4">
          <h2 className="text-3xl font-light text-ocean-deep">Get Virginia Beach tips delivered to your inbox.</h2>
          <form className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full sm:w-80 rounded-md border border-gray-200 px-3 py-2 text-sm"
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
