import { WIKI_RESTRUCTURE_KIT_BODY } from "@/lib/wiki-restructure-kit-content";

/**
 * Unlinked internal tool page for world-builders/contributors — deliberately
 * not in Nav.tsx or sitemap.ts, reachable only by direct URL (shared out-of-
 * band, e.g. via email/Discord). Added 2026-09-04 as a login-free
 * replacement for the same content previously hosted as a Claude Artifact
 * — see lib/wiki-restructure-kit-content.ts's file comment for why.
 *
 * A raw Route Handler (not a page.tsx) on purpose: this content is a
 * complete, already-tested static HTML/CSS/JS document (interactive copy
 * buttons, an offline JSON preview renderer) — serving it as a plain
 * Response ports it unchanged, with zero React/hydration risk, same
 * pattern as app/og-default/route.tsx. It does NOT get this site's Nav/
 * Footer chrome (those live in the (site) route group's layout.tsx,
 * which this route sits outside of) — appropriate for a tool page, and
 * avoids a double-header clash with this page's own masthead.
 */
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Wiki Restructure Kit</title>
</head>
<body>
${WIKI_RESTRUCTURE_KIT_BODY}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Static content, but not worth aggressive caching for a low-traffic
      // internal tool that may still be revised — short revalidate window
      // rather than immutable/long max-age.
      "Cache-Control": "public, max-age=300",
    },
  });
}
