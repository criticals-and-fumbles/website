@AGENTS.md

# Criticals and Fumbles (cnf.sg) — Project Memory

Phase 1 scaffold: static-content-driven pages backed by Sanity CMS, deployed
to Cloudflare as a Worker via `@opennextjs/cloudflare`, with Sanity Studio
hosted separately. No newsletter/email/payment integrations yet — those are
a later phase.

**Live URLs:**
- Site (production): https://cnf-sg.criticalsandfumbles.workers.dev
- Studio: https://cnf-website.sanity.studio

## Release History

**v0.1.1 — 2026-08-11.**

- Team member tiers renamed: `Horsemen`, `DM Council`, `Uncle's League`,
  `Critical Fumblers` (schema values are the no-space camelCase form —
  `Horsemen`/`DMCouncil`/`UnclesLeague`/`CriticalFumblers` — display titles
  carry the spaces/apostrophe). `teamMember.tier` now has `initialValue:
  "UnclesLeague"` so new documents default to a valid tier.
- `teamMember.role` (single free-text string) renamed to `roles` (multi-select
  array, 9 options: Dungeon Keeper, World Builder, Lore Master, Lore Keeper,
  Sage, Journeyman, Chronicler, Artisan, Architect — see `TEAM_MEMBER_ROLES`
  in `sanity/schemas/constants.ts`)
- Fixed a real production bug this rename caused: the schema/Studio side of
  the rename shipped (via `npx sanity deploy`) before the website code did,
  so `/team` (still on the old tier strings, no 4th section) silently
  dropped 6 of 7 team members — anyone whose tier had been re-saved in
  Studio under the new scheme matched no bucket. Fixed by finishing and
  merging the pending website-code branch — no data migration was needed,
  since the underlying document values were already consistent (see Lessons
  Learned below).
- Homepage Hero right panel replaced entirely: was a single "next event"
  card (picked the *oldest* event, a separate bug, since `startDate` is
  usually unset), now `HeroRightPanel`
  (`components/home/HeroRightPanel.tsx`) — a pinned-event banner (any
  `majorEvent` with status `registration-open`/`coming-soon`/
  `watch-this-space`, preferring registration-open) plus a merged
  "Latest Updates" feed spanning articles, events (major + regular), lore,
  sessions, and team members, newest-edited-first, capped at 5 (3 on
  mobile). See `HOME_PINNED_EVENT_QUERY` / `HOME_RSS_FEED_QUERY`.
- 1440p layout: added a `.container` utility (max-width 1440px, centred,
  1.5rem gutters) and applied it to the Hero section, which previously had
  no width cap and stretched full-bleed on wide monitors while every other
  section was already capped (this project's 18px root font-size makes
  Tailwind's `max-w-7xl` resolve to exactly 1440px). Article grid now goes
  to 4 columns at `min-[1440px]`.
- Cloudflare Workers Builds Git auto-deploy fixed and confirmed working
  (see Cloudflare deployment section)

**v0.1-pre-mvr — 2026-08-10.** Consolidation baseline before further feature
work; tagged at commit `42d6cdc`. What's actually in it:

- Full site scaffold deployed to Cloudflare as a Worker (`cnf-sg`, via
  `@opennextjs/cloudflare` — see Cloudflare deployment below; not Pages)
- Sanity Studio deployed separately at `cnf-website.sanity.studio`
- All four worlds scaffolded in the wiki (Titan's Gate, Temasek Tales,
  SingaporeZ, Shattered Tales)
- Light mode text contrast fixed on always-dark panels (Hero, PhilosophyStrip,
  Footer CTA, About Discord CTA)
- Mobile hamburger drawer: solid background, right-aligned, exact spec
  (280px, 24px padding, z-49/z-50, etc.)
- `article.status` defaults to `"published"` (was `"draft"`, which silently
  excluded newly-published articles from every query)
- Homepage/articles/events GROQ queries order by
  `coalesce(publishedAt, _updatedAt)` / `coalesce(startDate, _createdAt)`,
  so undated-but-published content doesn't get stranded out of a `[0...3]`
  slice
- ISR: `revalidate = 300` (5 min) on every page — unchanged since scaffold
- Worker bundle: ~1.09 MB gzipped as of v0.1.1 (well under the 3 MiB
  free-tier limit; was 0.86 MB at the original scaffold baseline, grew with
  the Hero RSS feed panel)
- Base font size 18px, custom body-text scale — tuned for 4K displays
  (done, not outstanding)

Known TODOs (not started):
- Visual Editing — mentioned in a consolidation request but not yet scoped
  anywhere in this repo's history; needs a real spec before starting
- Newsletter integration (Phase 2) — static "coming soon" UI only right now

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

Deploy manually with `npm run deploy` (currently just
`opennextjs-cloudflare deploy` — **verified in `package.json`: the npm
script does NOT chain a build step itself** [UNVERIFIED — confirm before
acting: whether the `opennextjs-cloudflare deploy` CLI command builds
internally before deploying, or requires a prior `build:cloudflare` step,
has not been re-tested this session]. The safe, verified-working pattern
used throughout this project is to always run `npm run build:cloudflare`
immediately before any deploy/preview-upload command, regardless). This
promotes straight to production traffic.

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

## Route structure — the `(site)` route group

All pages live under `app/(site)/` — **`(site)` is a folder name, not a URL
segment**, so `app/(site)/about/page.tsx` serves `/about`, not `/(site)/about`.
When adding a new page, put it under `app/(site)/`.

This route group exists for a reason that no longer applies but isn't worth
undoing: Sanity Studio originally lived at `app/studio/[[...tool]]/` with its
own root layout (Next.js requires one `<html>/<body>` per root layout, and
Studio needed a full-screen one with no site Nav/Footer), which meant the
site itself also needed to be a named route group rather than living directly
in `app/`. Studio has since been removed from this app entirely (see
Cloudflare deployment → Sanity Studio is hosted separately) — so today
there's only one root layout and the group isn't strictly necessary — but
flattening `app/(site)/*` back to `app/*` is a pure-organization change with
no functional upside, so it's been left as-is.

### Footer is per-page, not global

`components/layout/Footer.tsx` takes an optional `pageFooterCTA` prop
(Portable Text). Because each content type's `pageFooterCTA` field is
page-specific, `<Footer />` is **not** rendered in the root layout — every
`page.tsx` renders its own `<Footer pageFooterCTA={...} />` as the last
element in its JSX. Copy that pattern for new pages; forgetting it means no
footer on that route.

## Design system

Fonts (Google Fonts, loaded in `app/(site)/layout.tsx`):

| Role | Font | Tailwind class |
|---|---|---|
| Display / headings | Bebas Neue | `font-display` |
| Body / prose | Crimson Pro | default body font |
| UI / labels / tags | Space Mono | `font-ui` |

**Base font size is 18px (set on the `html` element) — optimised for a 4K
display.** Crimson Pro body text uses 1.125rem minimum. All font sizes use
rem units — never px for text — so they scale together off that 18px root.

Custom body-text scale (defined in `app/(site)/globals.css` `@theme inline`,
since this project has no `tailwind.config.ts` — Tailwind v4 here is
CSS-config-only):

| Utility | Size | Line-height | Use |
|---|---|---|---|
| `text-body-sm` | 1rem | 1.6 | — |
| `text-body` | 1.125rem | 1.65 | — |
| `text-body-lg` | 1.25rem | 1.7 | — |
| `text-body-xl` | 1.375rem | 1.7 | — |

Two additional named classes (not Tailwind utilities — plain CSS classes in
`globals.css`, applied directly to specific elements) cover the two spots
that needed an exact size not on that scale:

- `.prose-content` (1.25rem) — on `components/portable-text/Renderer.tsx`'s
  wrapper. All article/lore/session long-form body copy goes through this.
- `.card-description` (1.1rem) — on excerpt/description/summary text in
  `ArticleCard`, `ResourceCard`, `LoreCard`.

Colour tokens (CSS variables in `app/(site)/globals.css`, mapped through
`@theme inline` so they're usable as Tailwind utilities — `bg-emerald`,
`text-amber`, `border-magenta`, `bg-surface`, `text-text-muted`, etc.):

| Token | Dark (default) | Light |
|---|---|---|
| `bg` | `#111111` | `#FBF0E0` |
| `bg-forest` | `#0C1A10` | `#1A1208` |
| `surface` | `#1A1A1A` | `#F0E8D8` |
| `border` | `#2A2A2A` | `#E0D4C0` |
| `text` | `#F0EAE0` | `#1A1208` |
| `text-muted` | `#666666` | `#8A7055` |
| `emerald` | `#2EC56B` | `#1A7A45` |
| `amber` | `#C8893A` | `#B36A1A` |
| `magenta` | `#D946A8` | `#C4306A` |

Theme switching: `ThemeProvider` (`components/layout/ThemeProvider.tsx`)
toggles a `dark`/`light` class on `<html>`, persisted to `localStorage` under
`cnf-theme`. An inline script (`THEME_INIT_SCRIPT`, injected in
`app/(site)/layout.tsx` `<head>`) applies the class **before** hydration to
avoid a flash of the wrong theme.

Brand title treatment (three words, three colours) — reuse this exact
pattern, don't recreate it inline elsewhere:

```tsx
<span className="text-emerald font-display">Criticals</span>{" "}
<span className="text-amber font-display">&amp;</span>{" "}
<span className="text-magenta font-display">Fumbles</span>
```

Used on: homepage hero (`components/home/Hero.tsx`), `not-found.tsx`. Not
duplicated into a shared component per the original spec — copy the JSX if
you need it somewhere new, or extract one if it starts drifting.

## The four worlds

| Name | Slug | Colour accent |
|---|---|---|
| Titan's Gate | `titans-gate` | `#8B2FC9` |
| Temasek Tales | `temasek-tales` | `#C4692A` |
| SingaporeZ | `singaporez` | `#2C5F8A` |
| Shattered Tales | `shattered-tales` | `#6B3FA0` |

## Sanity schema summary

All schemas live in `sanity/schemas/`, registered in `sanity/schemas/index.ts`.
Two singletons (`siteSettings`, `philosophy`) pinned in the Studio structure
(`sanity.config.ts`) so editors can't create duplicates. Ten document types:
`world`, `teamMember`, `article`, `regularEvent`, `majorEvent`, `loreEntry`,
`sessionLog`, `organisation`, `resource`, `galleryPhoto`. One reusable object:
`calloutBlock` (used inside `article.body`, `loreEntry.body`,
`sessionLog.fullRecap`).

**To add a new schema:** create the file in `sanity/schemas/`, import and add
it to the `types` array in `sanity/schemas/index.ts`. If it needs GROQ
queries, add them to `sanity/lib/queries.ts` and the TS shape to
`sanity/lib/types.ts`.

**`galleryPhoto` stores a real Sanity `image` asset** (field name `image`,
type `"image"`, with hotspot + an `alt` subfield) — not a string URL, and
not R2-backed. `GALLERY_PHOTOS_QUERY` selects `image` directly; `GalleryPhoto`
in `sanity/lib/types.ts` types it as `SanityImage`. The only R2 bucket in
this project is `cnf-website-cache` (ISR incremental cache, see Cloudflare
deployment above) — there is no separate media/gallery R2 bucket.

**Current team roster is live data, not documented here** — it changes as
editors add members in Studio, so hardcoding names/tiers in this file would
go stale immediately. To check it, query Studio directly (Vision, or
`*[_type == "teamMember"]{handle, tier, roles}`) rather than trusting a
snapshot in this doc.

### Enum values that were inferred, not specified

The original spec left these field option lists undefined. Reasonable
defaults were chosen — **confirm with the team and edit the schema file
directly if they want different values** (all are plain `options.list`
arrays, easy to change):

- `teamMember.roles` — **renamed from `role`** (2026-08-10): was a single free-text
  string, now a multi-select array of an enum list (Dungeon Keeper, World
  Builder, Lore Master, Lore Keeper, Sage, Journeyman, Chronicler, Artisan,
  Architect — see `TEAM_MEMBER_ROLES` in `sanity/schemas/constants.ts`). Any
  GROQ query or component that still references singular `role` on a
  `teamMember` document is stale — use `roles` (array) instead.
  `teamMember.tier` values were also renamed the same session: `Leadership` →
  `Horsemen`, `RegularPlayer` → `UnclesLeague`, `Alumni` → `CriticalFumblers`,
  `DMCouncil` unchanged. `/team` now renders four sections: Horsemen, DM
  Council, Uncle's League, Critical Fumblers.
- `teamMember.socialLinks[].platform` — Discord, Twitter, Twitch, Instagram, YouTube (from the Character Sheet Card spec)
- `siteSettings.socialLinks[].platform` — Twitter, Instagram, YouTube, Twitch, TikTok (from the Footer spec)
- `regularEvent.eventType` — Campaign, One-Shot Series, Drop-In
- `regularEvent.frequency` — Weekly, Biweekly, Monthly, Ad-hoc
- `regularEvent.status` — Active, Recruiting, Full, Hiatus, Ended
- `majorEvent.eventType` — Convention, Tournament, Workshop, One-Shot Night, Social, Charity, Community
- `majorEvent.status` — this one **was** specified: `watch-this-space | coming-soon | registration-open | full | completed | cancelled`
- `sessionLog.tone` — Epic, Comedic, Tragic, Tense, Investigative, Social, Combat-Heavy, Mixed
- `article.category` — 10 values, taken from the homepage category strip (the spec text said "11 categories" but only listed 10 — used the 10 that were actually named: Campaign Craft, Classes, Combat, Reviews, World Building, Player Tips, DM Advice, Lore & Theory, Indie TTRPGs, Community)

### Pages not in the original site map

`/articles` and `/articles/[slug]` weren't in the spec's page list, but the
homepage ("All Articles →"), article cards, and author bylines all link to
them — added as the obvious missing piece.

## TODO / Follow-ups

(none outstanding — Phase 1.3's homepage activity feed shipped as the Hero
"Latest Updates" panel; see HeroRightPanel and Release History above)

## HeroRightPanel

`components/home/HeroRightPanel.tsx` — renders the homepage Hero's right
half. Two independent sections:

- **Pinned event banner** — renders only if `pinnedEvent` is non-null.
  Sourced from `HOME_PINNED_EVENT_QUERY`: any `majorEvent` with status
  `registration-open`/`coming-soon`/`watch-this-space`, preferring
  registration-open, then coming-soon, then most-recently-updated. GROQ
  note: ordering by a boolean comparison needs parens —
  `(status == "x") desc`, not `status == "x" desc` (the latter is a GROQ
  parse error, "unexpected postfix operator desc").
- **"Latest Updates" feed** — a flat, pre-merged, pre-sorted
  `RssFeedItem[]` (merging + sorting happens in `app/(site)/page.tsx`, not
  inside the component) spanning `article`, `majorEvent`, `regularEvent`,
  `loreEntry`, `sessionLog`, `teamMember`, newest `date` first, capped at 5.
  Items past index 2 are hidden below the `md` breakpoint (3 items on
  mobile, 5 from tablet up) via a per-item `hidden md:flex` class, not a
  separate query/prop.

Sourced from `HOME_PINNED_EVENT_QUERY` and `HOME_RSS_FEED_QUERY` in
`sanity/lib/queries.ts`; typed as `PinnedEvent` / `RssFeedItem` /
`RssFeedData` in `sanity/lib/types.ts`.

Unlike every other `bg-forest` panel on the site (which is deliberately
dark in both themes, paired with fixed `--on-forest`/`--on-forest-muted`
tokens), this panel **does** flip with the theme — dark green in dark mode,
`--surface` (light cream) in light mode — via the `.hero-right-panel` CSS
class in `globals.css`, paired with the normal theme-flipping
`text-text`/`text-text-muted` tokens. Don't reuse the on-forest tokens here.

The "live" pulsing dot next to the "Latest Updates" heading is the
`.live-dot` class + `@keyframes pulse-dot` in `globals.css`.

## Lessons learned

**Enum rename rule — don't skip the migration step.** This project hit the
consequence of skipping it once already (see v0.1.1 in Release History):
the `teamMember.tier` schema enum was renamed and deployed to Studio
(`npx sanity deploy`) in one session, but the website code that reads
`tier` (the `/team` page's section-bucketing logic) stayed on an unmerged
branch. Result: editors started saving the *new* tier values in Studio
(schema allowed it) while production still matched on the *old* string
literals — 6 of 7 team members silently stopped rendering anywhere. Nothing
in Sanity enforces enum values at the data layer; `options.list` is a
Studio-form-only constraint, so GROQ happily returns documents with
values that predate — or postdate — whatever the current schema says.
Correct order of operations for a live enum rename:
1. Deploy the schema and website code **together** (same merge, same
   deploy) — never let Studio's allowed values and the website's
   string-literal comparisons drift apart, even briefly.
2. If old documents might already hold the previous values, write a dry-run
   migration script before deploying, not after something breaks.
3. Only widen `options.list` to accept old+new values as a *transition*
   aid if the deploy can't be atomic — remove the old values once data is
   confirmed clean.

**Default values.** Enum/select fields should always set `initialValue` so
new documents aren't created in an invalid or ambiguous state. Current
defaults: `article.status` → `"published"`, `teamMember.tier` →
`"UnclesLeague"`, `teamMember.active` → `true`.

**Query safety.** A GROQ filter on an enum field (`status == "x"`) will
silently exclude any document whose stored value doesn't match — no error,
just missing content. When content that should exist doesn't appear,
check enum-based filters (and, as above, page-level string comparisons on
enum fields) before assuming the query itself is broken.

## Component conventions

- Data-fetching pages are `async` Server Components calling `client.fetch()`
  directly (see `sanity/lib/client.ts`) — no client-side data fetching except
  the wiki global search (`GlobalWikiSearch`) and the gallery lightbox, which
  filter/display data already fetched server-side and passed down as props.
- `export const revalidate = 300` on every page (5-minute ISR) — don't lower
  this per the original spec's instruction.
- Dynamic route params and `searchParams` are `Promise`s in this Next.js
  version — always `await params` / `await searchParams`. Use the generated
  `PageProps<'/route/[slug]'>` / `LayoutProps<'/route'>` global types (from
  `.next/types/routes.d.ts`, regenerated automatically by `next dev`/`next build`)
  instead of hand-writing prop types.
- Shared TypeScript shapes for every Sanity document type live in
  `sanity/lib/types.ts` — import from there instead of inlining `any`.
- Images: always route through `sanity/lib/image.ts` (`urlForImage`) into
  `next/image`. `next.config.ts` allows `cdn.sanity.io` as a remote pattern.
- No icon library — social links render as small text-label pills
  (Space Mono) instead of brand SVG icons. Swap in real icons later if wanted.
- Portable Text rendering goes through `components/portable-text/Renderer.tsx`
  (handles inline images and `calloutBlock`) — don't call `<PortableText>`
  directly in a page.

## Environment variables

See `.env.local.example`. Required: `NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`,
`SANITY_API_READ_TOKEN` (Viewer role, server-only — never expose to the
client), `NEXT_PUBLIC_SITE_URL` (filled in after the first Cloudflare Pages
deploy), `NEXT_PUBLIC_SITE_NAME`.

**`SANITY_API_WRITE_TOKEN`** — not currently in `.env.local` or
`.env.local.example` despite being referenced in a 2026-08-11 session (as
"the CNFSG-seed token, Editor role, for migration scripts") — that session
ended up not needing a write token (see Lessons learned above), so it was
never actually added. If a future migration script needs write access: add
it to `.env.local` (never commit it), keep it server/script-only, and
document the actual token/role here once it exists.

## Seed script

`sanity/seed.ts`, run via `npm run seed`. Idempotent — checks for existing
documents before creating. Seeds `siteSettings`, `philosophy`, the 4 worlds,
the history timeline, 3 placeholder team members, 1 placeholder `majorEvent`,
and 3 placeholder draft articles. Real content (bios, world descriptions,
articles) is meant to be filled in via Studio afterward — placeholders are
clearly marked in the seeded text.

## C&F design philosophy (for reference / prompting)

**Tagline:** "Good Players Make Good Tables. Good Tables Make Good Stories."

**Tier I — Values** (emerald): Community, Collaboration, Sincerity
**Tier II — Feelings** (amber): Your Seat, Your Party, Your Campaign
**Tier III — Outcomes** (magenta): A Guild That Runs Itself, Worlds Worth
Returning To, Friends Who Know Your Alignment

Full wording lives in the `philosophy` Sanity singleton — editable via
Studio, not hardcoded in components (except the `PhilosophyStrip` fallback
tagline).
