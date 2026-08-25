import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Exact-case-sensitive redirects for documents that had uppercase/mixed-
// case slugs (Screaming Frog audit, 2026-08-25), now fixed in Sanity to
// lowercase. These live here rather than in next.config.ts's redirects()
// because that mechanism's path matching is case-INSENSITIVE by default —
// a literal-cased source there would also match its own already-lowercase
// destination and self-redirect, making the fixed URL unreachable either
// way (caught locally before deploy). String equality here gives exact
// control next.config.ts's path-to-regexp matching doesn't.
const EXACT_CASE_REDIRECTS: Record<string, string> = {
  "/events/Batam-Heroes-Tavern": "/events/batam-heroes-tavern",
  "/team/DragonLance": "/team/dragonlance",
  "/team/Xyzqrst": "/team/xyzqrst",
};
// The worldUnit itself plus its 6 fixed sub-pages (/sessions, /factions,
// /figures, /items, /lore, /places) all share this one old-cased prefix.
const OLD_AMARIN_PREFIX = "/wiki/titans-gate/Amarin";
const NEW_AMARIN_PREFIX = "/wiki/titans-gate/amarin";

// next.config.ts's headers() is NOT honored by @opennextjs/cloudflare at
// request time the way it is on Vercel — middleware is the mechanism
// OpenNext actually translates into Cloudflare-side behavior, so security
// headers have to be set here rather than via next.config.ts.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const exactMatch = EXACT_CASE_REDIRECTS[pathname];
  if (exactMatch) {
    return NextResponse.redirect(new URL(exactMatch, request.url), 308);
  }
  if (pathname === OLD_AMARIN_PREFIX || pathname.startsWith(`${OLD_AMARIN_PREFIX}/`)) {
    const rest = pathname.slice(OLD_AMARIN_PREFIX.length);
    return NextResponse.redirect(new URL(`${NEW_AMARIN_PREFIX}${rest}`, request.url), 308);
  }

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
