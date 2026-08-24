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
  async redirects() {
    return [
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
