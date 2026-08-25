import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// next.config.ts's headers() is NOT honored by @opennextjs/cloudflare at
// request time the way it is on Vercel — middleware is the mechanism
// OpenNext actually translates into Cloudflare-side behavior, so security
// headers have to be set here rather than via next.config.ts.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // 'unsafe-inline' is required by the theme-init inline <script> in
      // app/(site)/layout.tsx (dangerouslySetInnerHTML) — a nonce/hash-based
      // CSP would be tighter but needs per-request nonce plumbing through
      // that script tag; tracked as a follow-up rather than done here.
      // googletagmanager.com is required by the @next/third-parties
      // GoogleAnalytics integration (also in that layout).
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.sanity.io",
      "font-src 'self' data:",
      "connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io https://*.google-analytics.com https://*.analytics.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  return response;
}

export const config = {
  // Skip static assets/Next internals — headers on every HTML/API
  // response is what these checks require, not on every asset byte.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
