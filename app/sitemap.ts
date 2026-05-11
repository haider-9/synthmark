import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://synthmark.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  return [
    // ── Public marketing / auth pages ──────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/auth/sign-up`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/auth/sign-in`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // ── Authenticated app pages (lower priority; noindex in practice) ───────
    {
      url: `${BASE_URL}/projects`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tasks`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/team`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/analytics`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // Included for completeness; individual route sets noindex robots in practice
      url: `${BASE_URL}/dashboard`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
