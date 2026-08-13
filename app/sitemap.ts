import type { MetadataRoute } from "next";

export const dynamic = "force-static";

import { SITE_URL } from "../lib/site-url";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
      lastModified: "2026-07-28",
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
      url: `${BASE}/blog/best-beaches-in-virginia-beach`,
      lastModified: "2026-07-28",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/best-time-to-visit-virginia-beach`,
      lastModified: "2026-07-28",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/how-to-keep-beach-umbrella-from-blowing-away`,
      lastModified: "2026-07-28",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/beach-day-with-baby-toddler-virginia-beach`,
      lastModified: "2026-07-28",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/virginia-beach-parking-beach-access-guide`,
      lastModified: "2026-07-28",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/beach-chair-rental-virginia-beach`,
      lastModified: "2026-05-27",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/blog/what-to-bring-to-virginia-beach`,
      lastModified: "2026-05-27",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE}/blog/food-delivery-to-the-beach`,
      lastModified: "2026-05-27",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE}/blog/how-to-plan-a-private-beach-event-in-virginia-beach`,
      lastModified: "2026-05-27",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE}/blog/ultimate-virginia-beach-family-vacation-guide-2026`,
      lastModified: "2026-05-27",
      changeFrequency: "monthly",
      priority: 0.65,
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
}
