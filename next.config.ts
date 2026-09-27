import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Canonical domain is www.criticalsandfumbles.com. The apex domain and
  // the original *.workers.dev URL both still resolve to this Worker with
  // no server-side redirect between them — Google was left to infer
  // domain preference from <link rel="canonical"> alone, which produced
  // GSC "Duplicate, Google chose different canonical than user" errors.
  // These host-based redirects give it an explicit signal.
  //
  // Path-based (not host-based) redirects, e.g. for a fixed uppercase
  // slug, do NOT belong here — next.config.ts redirects() path matching
  // is case-INSENSITIVE by default, so a literal-cased source would also
  // match its own already-lowercase destination and self-redirect,
  // making the fixed URL unreachable either way (caught locally before
  // deploy, 2026-08-25). Use middleware.ts for those instead, where an
  // exact-case string comparison is straightforward.
  async redirects() {
    return [
      // Exact-root rules, evaluated before the wildcard ones below (Next
      // uses the first matching entry). Needed because ":path*" matches
      // zero segments on a bare "/" request, and the destination's
      // ":path*" placeholder doesn't get substituted for that empty-match
      // case under this OpenNext/Cloudflare setup — it was left in
      // literally, sending "/" to ".../:path*", which 404s. Confirmed via
      // curl on both hosts (2026-09-27) before adding this fix.
      {
        source: "/",
        has: [{ type: "host", value: "^criticalsandfumbles\\.com$" }],
        destination: "https://www.criticalsandfumbles.com/",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "^cnf-sg\\.criticalsandfumbles\\.workers\\.dev$" }],
        destination: "https://www.criticalsandfumbles.com/",
        permanent: true,
      },
      {
        // Anchored exact match — unanchored "criticalsandfumbles.com" also
        // matches "www.criticalsandfumbles.com" as a substring, which
        // caused every page on the canonical host to 308-redirect to
        // itself in production. Do not remove the anchors.
        source: "/:path*",
        has: [{ type: "host", value: "^criticalsandfumbles\\.com$" }],
        destination: "https://www.criticalsandfumbles.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "^cnf-sg\\.criticalsandfumbles\\.workers\\.dev$" }],
        destination: "https://www.criticalsandfumbles.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
