# SEO & Infrastructure

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved (internal
"see below"/"above" references updated to point at the correct file).
Read this when working on metadata, OG images, domain/env config, R2
usage, Cloudflare deployment, or bundle-size history.

## Known Risks

### Bundle size — RESOLVED (as of v0.1.9, 2026-08-12)

**Current: ~1.36 MB gzip / 3 MiB free-tier limit (45% used). Headroom
restored to ~1.7 MB.** This is the authoritative current figure — bundle
size numbers quoted inside Release History entries (`docs/release-history.md`)
are point-in-time snapshots from when each release shipped, not live
state; this section is what to check before adding anything.

**Formerly an active risk (Phase 1.4 → v0.1.8):** `next/og`'s
`ImageResponse` (used in `app/og-default/route.tsx` and
`app/(site)/events/[slug]/opengraph-image.tsx`) bundled a WASM-based image
renderer (Satori + a PNG encoder) directly into the main site's Worker,
regenerating images on every request. This nearly doubled the bundle in
the Phase 1.4 session (1.10 MB → 2.08 MB gzip) and stayed the dominant
contributor through v0.1.8.

**Fixed in v0.1.9** by moving image generation out of the main Worker
entirely — see "OG image generation (v0.1.9)" below for the full
architecture. Bundle dropped 2138 → 1355 KiB gzip. `next/og` is no longer
imported anywhere in the main app.

**Implications for future sessions:**
- Before adding any new dependency, still check bundle size impact with
  `npm run build:cloudflare` (then `npx wrangler versions upload
  --preview-alias <name>` to get the real gzip figure) BEFORE and AFTER —
  the discipline stays even though the immediate pressure is gone
- Headroom is materially better now (~1.7 MB vs. the ~0.87 MB low point),
  but don't treat that as license to stop checking
- If a future feature needs WASM-based rendering/processing again (image,
  PDF, video, etc.), the `workers/og-generator` pattern — a standalone
  Worker with its own bundle budget, writing results to R2, read back by
  the main site via an R2 binding — is the template to reuse rather than
  re-adding heavy compute to the main Worker

## Stack

- **Framework:** Next.js 16.3 (App Router, TypeScript, no `src/` directory)
- **Styling:** Tailwind CSS v4 (CSS-variable theme in `app/(site)/globals.css`) — no component libraries
- **CMS:** Sanity v6, Studio hosted separately (see below) — **not** embedded in the Next.js app
- **Cloudflare adapter:** `@opennextjs/cloudflare`
- **Content rendering:** `@portabletext/react` (added beyond the original dependency list — required to render Sanity Portable Text fields and the custom `calloutBlock` type; not optional)
- **Node:** 20 LTS · npm

## Cloudflare deployment

`@opennextjs/cloudflare` builds this app as a **Cloudflare Worker** (not the
legacy Cloudflare Pages Git-integration product) — `wrangler.toml` has `main`
pointing at `.open-next/worker.js` and an `[assets]` block, which is the
Workers-with-static-assets shape, not a Pages `_worker.js`. If you connect
this repo to Cloudflare for automatic deploys, use **Workers Builds** (Git
integration for Workers), not the classic Pages dashboard flow.

**Git-connected Workers Builds is active and working (fixed 2026-08-10).**
A Cloudflare project (Pages or Workers Builds — not visible via `wrangler
pages project list`, which returned empty, so CLI-invisible either way) has
this repo's Git connection, with **"Builds for non-production branches"
enabled** — every push to any branch triggers an auto-build, not just
`main`. It originally built with the *wrong* command (plain `npm run
build`) and no Sanity env vars configured, so it failed at "Collecting
page data" with `Configuration must contain projectId`. Both were fixed in
the dashboard (**Settings → Build**):

- Build command: `npm run build:cloudflare` (not `npm run build` — the
  bare Next.js build skips the OpenNext/Cloudflare adapter step entirely)
- Env vars (Settings → Environment Variables), matching
  `.env.local.example`: `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`,
  `SANITY_API_READ_TOKEN` (as a **secret**, not plain text),
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`

**Gotcha hit while fixing this:** a trailing whitespace character pasted
into the `NEXT_PUBLIC_SANITY_DATASET` value caused `Datasets can only
contain lowercase characters, numbers, underscores and dashes...` —
Sanity validates the string literally, untrimmed. If a dashboard env var
value was copy-pasted, check for trailing whitespace before assuming the
value itself is wrong.

This auto-build is now a second, parallel path alongside the manual one
below — a push to any branch builds automatically now, in addition to
(or instead of) manually running `wrangler versions upload`.

That same Build settings page also showed a **"Sanity Deploy Hook"**
(a Cloudflare deploy-hook URL, presumably pasted into Sanity's webhook
config so publishing content would trigger a rebuild) — left as-is,
not investigated further. If content publishes ever appear to trigger a
build, that's why; revisit if it also misbehaves.

Deploy manually with `npm run deploy`. **Fixed 2026-08-28 (issue #20):**
`npm run deploy` now runs `build:cloudflare` first
(`"deploy": "npm run build:cloudflare && opennextjs-cloudflare deploy"`)
— it's no longer possible to accidentally redeploy a stale `.open-next`
directory via the normal script. If prebuilt output genuinely needs to
be deployed as-is (e.g. re-pushing an already-built version with no
source changes), use `npm run deploy:prebuilt` instead — that's the one
remaining path that skips the build, and it's named so it can't be run
by accident.

**CONFIRMED 2026-08-20, the hard way, before this fix existed:** the old
plain `opennextjs-cloudflare deploy` does NOT build — its own `--help`
says "Deploy a **built** OpenNext app," and it happily redeployed a
stale `.open-next` directory with zero warning that nothing actually
changed. A session ran `npm run deploy` four times across ~15 minutes of
real Nav/Footer/route changes, and every one reported success — but
`.open-next`'s mtime was from a full day earlier, so all four deploys
re-shipped the exact same stale bundle. The tell, in hindsight: the
upload step said "No updated asset files to upload" every time (should
have been the immediate signal something was wrong) until the actual
rebuild, at which point it correctly said "Found 1 new or modified
static asset to upload... + /BUILD_ID". The pages *looked* like they'd
updated once (a Sanity content change made an unrelated, already-
deployed component render new data) which masked the problem for a
while. This history is kept here as the reason `deploy:prebuilt` is a
separate, deliberately-named script rather than a flag — the whole point
is that skipping the build should never be the default or an accident.
`npm run deploy` promotes straight to production traffic.

**Preview a branch without touching production:** build (`npm run
build:cloudflare`), then `npx wrangler versions upload --preview-alias
<name>`. This uploads a version and gives back two URLs — a random one
(`https://<version-id>-cnf-sg.criticalsandfumbles.workers.dev`) and a
stable alias one (`https://<name>-cnf-sg.criticalsandfumbles.workers.dev`)
— without shifting any production traffic to it. Promote a previewed
version to production with `wrangler versions deploy`, or just do a normal
`npm run deploy` once the branch is merged to `main`.

### Sanity Studio is hosted separately — not deployed with the site

**This was a mid-build architecture change from the original spec**, which
called for an embedded `/studio` route. That produced a **21 MB** server
Worker bundle (Sanity Studio — its visual editor, image tooling, syntax
highlighting, etc. — is enormous), versus Cloudflare's 3 MiB (free) / 10 MiB
(paid) limits. There is no config fix for this; Studio just cannot ship
inside the same Worker as the site. Confirmed by removing `app/studio/` and
comparing: bundle dropped from 21 MB to 3.5 MB (0.86 MB gzipped) — Studio
alone was ~83% of the bundle.

Studio is instead deployed via Sanity's own free hosting:
```
npm run studio:deploy   # sanity deploy — reads sanity.config.ts + sanity.cli.ts
npm run studio          # sanity dev — local Studio dev server, separate from `next dev`
```
`sanity.cli.ts` pins the project/dataset and the Studio `appId` so `deploy`
doesn't prompt interactively. If you ever want Studio embedded again, you'd
need a genuinely separate deployment target for it (it cannot coexist with
the site in one Worker) — not a small change.

**Runtime dependency you might not expect:** `styled-components` had to be
added as a direct dependency — `sanity`'s `peerDependencies` requires it,
but it isn't auto-installed. `sanity deploy` fails with "Declared dependency
`styled-components` is not installed" without it.

### Pinned versions — do not casually bump

- **`wrangler` → `4.86.0`, `compatibility_date` → `2026-05-03`.** Every
  wrangler version from `4.87.0` on requires **Node ≥22**, which conflicts
  with this project's Node 20 LTS — there is no version satisfying both. If
  you move this project to Node 22+, bump both together, or local
  preview/deploy breaks with a "compatibility date not supported" error.
- **`@sanity/cli` → `7.2.3`.** Every version from `7.3.0` on also requires
  Node ≥22 (the main `sanity` package itself only has an *advisory* engines
  field and works fine on Node 20 — this pin is specifically about the CLI
  binary's hardcoded runtime check). Bump alongside `wrangler`/Node together
  if you move to Node 22+, not independently.
- **No `[limits] cpu_ms` in `wrangler.toml`.** The original spec included
  `cpu_ms = 50`, but CPU limits are a paid-Cloudflare-plan-only feature —
  including it blocks every deploy on the Free plan with "CPU limits are not
  supported for the Free plan." Add it back if/when the account upgrades.

**R2 bucket required for ISR caching to actually persist:** `wrangler.toml`
declares an `[[r2_buckets]]` binding (`NEXT_INC_CACHE_R2_BUCKET`,
`bucket_name = "cnf-website-cache"`) for `open-next.config.ts`'s
`r2IncrementalCache`. The real bucket has already been created
(`wrangler r2 bucket create cnf-website-cache`) — locally, `wrangler
dev`/`preview` emulate it automatically regardless. Without a real bucket in
production, ISR revalidation would silently no-op (pages still render, just
never cache; `R2IncrementalCache` throws an `IgnorableError` that OpenNext
catches) — this is already handled, just noting why the binding exists.

**No D1 database.** The original scaffold spec included a D1 binding with a
placeholder ID; it was omitted since nothing in the app uses D1 (the cache
is R2-backed) and a placeholder ID would have blocked `wrangler deploy`. Add
one later if a real use case needs it.

## SEO & Discord funnel (Phase 1.4)

**`lib/metadata.ts`** — `buildMetadata({ title, description, path, image?,
type? })` returns a `Metadata` object (title with `| Criticals and
Fumbles` suffix unless already present, Open Graph, Twitter card,
canonical). Every dynamic detail page (`events/[slug]`, `articles/[slug]`,
`team/[slug]`, `wiki/[world]`, `wiki/[world]/lore/[slug]`,
`wiki/[world]/sessions/[slug]`) exports `generateMetadata` using it;
static pages (`/`, `/events`, `/about`) export a plain `metadata` const
with it. Falls back to `/og-default` (see below) when no `image` is
passed. Also exports `plainTextFromBlocks()` — first-span plain text from
a Portable Text body, used as a description fallback when no dedicated
excerpt/summary/tagline field is set.

**Dynamic OG images** — `next/og`'s `ImageResponse`, no static image file:
- `app/og-default/route.tsx` → `/og-default` — branded site-wide fallback
  (three-colour title treatment, dark background), used by `buildMetadata`
  whenever no `image` is passed
- `app/(site)/events/[slug]/opengraph-image.tsx` — per-event image;
  prefers the event's real `splashImage`/`coverImage` if set, else
  generates a branded fallback with the event's title. **Caveat:** since
  `generateMetadata` on the same route always explicitly sets
  `openGraph.images` (via `buildMetadata`), that explicit value takes
  precedence over this file-convention image for the actual `og:image`
  meta tag — the route still exists and is directly fetchable, but isn't
  automatically wired into the tag. Real photos still show correctly
  either way (both paths end up finding the same image); only the
  per-event *generated* fallback (vs. the generic site fallback) doesn't
  get used when an event has no photo. Not fixed this session — noting it
  rather than leaving it silently wrong.
- No explicit `runtime = "edge"` on either — Edge Runtime is deprecated in
  this Next.js version; both work fine on the default runtime
- These are the largest single contributor to this session's bundle growth
  (see `docs/release-history.md`) — reuse rather than duplicate if adding
  more image generation elsewhere

**Structured data** (`components/seo/`) — plain `<script
type="application/ld+json">` components, no library:
- `EventStructuredData` — schema.org `Event`, rendered once per event
  detail page
- `ArticleStructuredData` — schema.org `Article`, rendered once per
  article detail page
- `OrganizationStructuredData` — schema.org `Organization`, rendered once
  in the root layout `<head>`; `sameAs` is built live from
  `siteSettings.socialLinks` + `discordUrl`, not hardcoded

**Sitemap & robots** — `app/sitemap.ts`, `app/robots.ts` (both at the app
root, not under `(site)/`, since neither needs the Nav/Footer layout).
Sitemap pulls minimal `{slug, _updatedAt}` projections via 3 dedicated
queries (`SITEMAP_ARTICLES_QUERY`, `SITEMAP_EVENTS_QUERY`,
`SITEMAP_WORLDS_QUERY` in `sanity/lib/queries.ts`) rather than reusing the
card queries, which fetch images/refs the sitemap doesn't need. `robots.ts`
disallows `/api/` (pre-emptive — no API routes exist yet) but *not*
`/studio` (there is no `/studio` route on this site — Studio is hosted
entirely separately, see Cloudflare deployment above).

**Discord CTA locations** — homepage Hero (secondary button), events index
page (CTA band above footer), event detail pages (near/in place of the
Register button), footer (pre-existing prominent button, left as-is). All
source the URL from `siteSettings.discordUrl` fetched server-side and
passed down as props — never a hardcoded string.

**Social links pattern** — `siteSettings.socialLinks` (existing field,
platform enum: Twitter/Instagram/YouTube/Twitch/TikTok/Facebook) feeds the
nav/drawer icons (`components/layout/Nav.tsx`) and `sameAs` in structured
data. Icons themselves are `components/icons/SocialIcons.tsx` (Facebook,
Instagram, Discord — shared by `Nav.tsx` and `Hero.tsx`, not duplicated).
Discord is **not** in `socialLinks` — it has its own dedicated
`discordUrl`/`discordServerName` fields on `siteSettings`.

**Email removed from footer display only** — `Footer.tsx` no longer
renders `siteSettings.contactEmail`. The schema field and the document's
stored value are both untouched; this was a component-only change,
verified by re-fetching the live document afterward (see
`docs/lessons-learned.md`).

## OG image generation (v0.1.9)

Dynamic OG image rendering moved out of the main site's Worker entirely
— see Known Risks → Bundle size above for why. Two-part architecture:

**`workers/og-generator/`** — a standalone Cloudflare Worker, own
`package.json`/`wrangler.toml`/deploy (`cd workers/og-generator && npm
run deploy`), own 3 MiB bundle budget completely separate from the main
site. Live at `https://cnf-og-generator.criticalsandfumbles.workers.dev`.
Renders the same branded images the old `next/og` routes did (JSX ported
1:1 into `src/templates.tsx`), using `satori` + `@resvg/resvg-wasm`
directly rather than `@vercel/og`/`next/og` — those auto-load their
WASM/font assets via `fetch(new URL(path, import.meta.url))`, which only
resolves inside Next.js/Vercel's runtime and **hangs indefinitely** (not
an error — a silent hang until Cloudflare's runtime kills the request)
in a raw Workers environment. Fixed by using satori's `"satori/standalone"`
entry point + `@resvg/resvg-wasm`'s `initWasm()`, both of which take an
explicit `WebAssembly.Module` — imported directly via Workers' native
`.wasm` module support, no fetch/URL resolution involved. The embedded
font (`assets/noto-sans-regular.ttf`) is Noto Sans Regular, OFL-licensed,
copied from `@vercel/og`'s own vendored copy (satori has no built-in font
— it can't render any text without one).

Two endpoints, both POST, both require an `x-og-webhook-secret` header
matching the `WEBHOOK_SECRET` secret (`wrangler secret put
WEBHOOK_SECRET` — not Sanity's built-in HMAC-signature webhook option,
which is a different, unused verification path):
- `/generate/default` — regenerates the branded site-wide fallback,
  written to `og-default.png` in R2. Not webhook-triggered (nothing to
  trigger it on — it doesn't depend on any document); run manually if the
  branding ever changes.
- `/generate/event` — takes `{ slug, title, photoUrl? }`, writes
  `events/{slug}.png`. Triggered by a Sanity webhook on `majorEvent`
  create/update, **filtered to exclude drafts**
  (`_type == "majorEvent" && !(_id in path("drafts.**"))`) — an earlier,
  unfiltered version of this filter fired on every Studio autosave
  keystroke while editing a draft, not just on publish (24 webhook calls
  from one edit session, confirmed via `wrangler tail` before the filter
  was fixed). `photoUrl` (if the event has a real splash/cover image) is
  fetched and inlined as a base64 data URI before rendering — satori has
  no network access of its own, `<img src>` must already be a data URI.

Both write to the **`cnf-website-og-images`** R2 bucket (separate from
`cnf-website-cache`, which is ISR-cache-only with different lifecycle
needs).

**Main site side** — `app/og-default/route.tsx` and
`app/(site)/events/[slug]/opengraph-image.tsx` no longer import `next/og`
at all. Both read the pre-generated PNG back from R2 via a new
`OG_IMAGES_BUCKET` binding (`wrangler.toml` + `cloudflare-env.d.ts`,
which extends `@opennextjs/cloudflare`'s ambient `CloudflareEnv`
interface — see `getCloudflareContext({ async: true })` usage in both
routes). The event route still proxies a real event photo directly when
one's set (unchanged); only the generated-fallback path moved. If R2
doesn't have an object yet (webhook hasn't fired, or `/generate/default`
was never run), these routes 404 rather than falling back to generating
on-the-fly — there's no on-the-fly path left at all by design.

**Verify after any deploy that touches R2 config, or after a fresh
environment setup (issue #21):** `npm run verify:og-default` fetches the
live `/og-default` route and confirms it actually returns a 200 image,
not just that the deploy succeeded — a missing `og-default.png` object
has no visible symptom otherwise (every page's `og:image`/Twitter card
just silently points at a 404 until someone shares a link and notices).
Pass a preview alias URL as an argument to check a preview deploy instead
of production: `npm run verify:og-default -- https://<alias>-cnf-sg.criticalsandfumbles.workers.dev`.

**Repo structure note:** `workers/` is excluded from the root
`tsconfig.json` and `eslint.config.mjs` — it's a fully separate npm
project with its own `node_modules`/toolchain, not part of the Next.js
app's type-check or lint scope. `@cloudflare/workers-types` was added as
a devDependency to the **main** project (not `workers/og-generator`,
which has its own) purely so `cloudflare-env.d.ts` can reference
`R2Bucket`.

## Environment variables

See `.env.local.example` (restored 2026-08-28, issue #23 — it had been
missing from the repo despite being referenced here). Required:
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
`NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN` (Viewer role,
server-only — never expose to the client), `NEXT_PUBLIC_SITE_URL`
(`https://www.criticalsandfumbles.com` as of 2026-08-14 — see
`docs/release-history.md` v0.1.12; must match whatever's set in
Cloudflare's Workers Builds dashboard env vars for production, see
Cloudflare deployment above). `NEXT_PUBLIC_GA_ID` is optional (Google
Analytics, no-op if unset).

**Correction, 2026-08-28:** this section previously also listed
`NEXT_PUBLIC_SITE_NAME` as required — checked against actual code while
restoring `.env.local.example` and it isn't read from `process.env`
anywhere; `lib/metadata.ts`'s `SITE_NAME` is a hardcoded string constant.
Not included in the restored example file for that reason. If a future
session wants the site name configurable via env, that's a real (small)
code change to `lib/metadata.ts`, not just a docs fix.

**`SANITY_API_WRITE_TOKEN`** — added to `.env.local` on 2026-08-11 (Editor
role) for `sanity/migrations/patch-unit-labels.ts`. Not in
`.env.local.example` since it's not required for normal dev/build — only
for running a write-access migration script. Server/script-only, never
client-side; never commit the actual value.

## Scheduled Sanity backup (2026-09-04)

`.github/workflows/sanity-backup.yml` — the first GitHub Actions
workflow in this repo (everything else deploys via Cloudflare's git-
integrated Workers Builds, see "Cloudflare deployment" above; this
workflow exists only because a scheduled job needs somewhere to run,
and this repo already had a working `sanity.cli.ts` for it to use).

Runs daily at 04:00 Singapore Time (`0 20 * * *` in UTC — SGT is UTC+8,
no DST) via `sanity dataset export` (documents + assets, drafts
included — confirmed a Viewer-role token is sufficient, no elevated
token needed for a read-only backup), uploaded to the `cnf-media` R2
bucket's S3-compatible API under `sanity-backups/<weekday>.tar.gz`.

**Retention is 7 rotating filenames, not an R2 lifecycle rule.** The
upload key is named after the CURRENT day of the week in Singapore time
(`monday.tar.gz` … `sunday.tar.gz`) — next Monday's run overwrites this
Monday's file in place, so exactly 7 archives ever exist and nothing
needs pruning. Also has a `workflow_dispatch` trigger for a manual
on-demand backup (e.g. right before a risky operation like a Wiki
Restructure import, which does a full-replace of a world's
`world.sections` — see cnf-website issue #26).

Required repo secrets: `SANITY_API_READ_TOKEN` (same token already used
elsewhere in this app — reused, not a new credential) plus
`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY` — R2's S3-compatible HMAC key
pair, NOT a Cloudflare API token (different credential type). Create via
Cloudflare dashboard → R2 → Manage R2 API Tokens, scoped to "Object Read
& Write" on the `cnf-media` bucket specifically, not account-wide.
