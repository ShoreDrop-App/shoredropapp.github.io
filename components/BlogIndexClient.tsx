"use client";

import { useMemo, useState } from "react";
import { blogPosts, type BlogPost } from "../lib/blog-posts";

const CHIPS = ["All", "Beach Tips", "Virginia Beach Tips", "Food Delivery", "Private Events"] as const;
type Chip = (typeof CHIPS)[number];

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function matchesChip(post: BlogPost, chip: Chip): boolean {
  if (chip === "All") return true;
  return post.category === chip;
}

export default function BlogIndexClient() {
  const [active, setActive] = useState<Chip>("All");

  const filtered = useMemo(
    () => blogPosts.filter((post) => matchesChip(post, active)),
    [active]
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {CHIPS.map((chip) => {
          const selected = active === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActive(chip)}
              aria-pressed={selected}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selected
                  ? "bg-[#083b6c] text-white"
                  : "bg-[#e6f9ff] text-ocean-deep hover:bg-[#d4f3ff]"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground mb-10">
          No posts in this category yet.
        </p>
      ) : (
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm"
            >
              <a href={`/blog/${post.slug}/`} className="block">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-5 space-y-3">
                <button
                  type="button"
                  className="text-xs uppercase tracking-wide text-muted-foreground hover:text-ocean-deep"
                  onClick={() => setActive(post.category)}
                >
                  {post.category}
                </button>
                <h2 className="text-xl font-semibold text-ocean-deep leading-tight">
                  <a href={`/blog/${post.slug}/`} className="hover:underline">
                    {post.title}
                  </a>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
