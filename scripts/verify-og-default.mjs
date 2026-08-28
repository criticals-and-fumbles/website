#!/usr/bin/env node
/**
 * Deploy health check for the default OG image (issue #21).
 *
 * lib/metadata.ts falls back to `${SITE_URL}/og-default` for any page
 * with no dedicated image, and that route (app/og-default/route.tsx)
 * reads `og-default.png` straight out of the OG_IMAGES_BUCKET R2 bucket
 * with NO on-the-fly fallback — if the object is missing (fresh R2
 * bucket after an environment rebuild, or someone deleted it), every
 * page relying on the default image emits an <og:image> that 404s.
 *
 * This script just fetches the live route and checks it actually
 * returns a 200 image, so that failure mode surfaces immediately after
 * a deploy instead of being discovered later via a broken social-share
 * preview. Run manually after any deploy that touches R2 config, or as
 * part of a broader post-deploy checklist — no CI wiring, since this
 * repo's CI only handles the `campaigns` Worker (see that repo's own
 * `.github/workflows/deploy.yml`); this site's Workers Build path
 * doesn't run custom post-deploy steps.
 *
 * Usage: node scripts/verify-og-default.mjs [siteUrl]
 *   node scripts/verify-og-default.mjs
 *   node scripts/verify-og-default.mjs https://preview-alias-cnf-sg.criticalsandfumbles.workers.dev
 */

const siteUrl = (
  process.argv[2] ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.criticalsandfumbles.com"
).replace(/\/$/, "");

const url = `${siteUrl}/og-default?cb=${Date.now()}`; // cache-bust, same convention as this session's live-deploy checks

console.log(`Checking ${url} ...`);

const res = await fetch(url);
const contentType = res.headers.get("content-type") ?? "";

if (res.status !== 200) {
  console.error(`FAIL — expected 200, got ${res.status} ${res.statusText}`);
  console.error(
    "The default OG image is likely missing from the OG_IMAGES_BUCKET R2 bucket " +
      "(og-default.png) — see app/og-default/route.tsx and workers/og-generator " +
      "for how it's supposed to get there.",
  );
  process.exit(1);
}

if (!contentType.startsWith("image/")) {
  console.error(`FAIL — expected an image content-type, got "${contentType}"`);
  process.exit(1);
}

const bytes = (await res.arrayBuffer()).byteLength;
console.log(`OK — 200, ${contentType}, ${bytes} bytes`);
