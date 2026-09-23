import type { MetadataRoute } from "next";

export const dynamic = "force-static";

import { SITE_URL } from "../lib/site-url";
import { blogPosts } from "../lib/blog-posts";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: "2026-04-21",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE}/support`,
      lastModified: "2026-05-07",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/app`,
      lastModified: "2026-06-15",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/orders`,
      lastModified: "2026-07-15",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/booking`,
      lastModified: "2026-07-15",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/food`,
      lastModified: "2026-07-15",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/mission`,
      lastModified: "2026-06-26",
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog`,
      lastModified: "2026-09-01",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/private-events`,
      lastModified: "2026-06-02",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/kiosk`,
      lastModified: "2026-08-31",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: "2026-08-12",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/sms`,
      lastModified: "2026-08-12",
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE}/delete-account`,
      lastModified: "2026-07-15",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/terms`,
      lastModified: "2026-08-12",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/cancellation`,
      lastModified: "2026-04-22",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/rental-policy`,
      lastModified: "2026-04-22",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/liability-waiver`,
      lastModified: "2026-04-22",
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
