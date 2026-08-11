import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cnf.sg";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // No /studio here — Sanity Studio is hosted entirely separately at
      // cnf-website.sanity.studio, never embedded in this app (see
      // CLAUDE.md § Sanity Studio is hosted separately). /api/ is
      // preemptive — no API routes exist yet, but Phase 2 (newsletter)
      // will likely add one.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
