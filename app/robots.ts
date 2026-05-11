import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://synthmark.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Default: allow public pages, block authenticated app routes ───────
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/project",
          "/projects",
          "/tasks",
          "/team",
          "/analytics",
          "/api",
        ],
      },

      // ── Slower bots: apply crawl delay to reduce server load ──────────────
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
        crawlDelay: 10,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
