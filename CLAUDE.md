@AGENTS.md

# Criticals and Fumbles (cnf.sg) — Project Memory

Phase 1 scaffold: static-content-driven pages backed by Sanity CMS, deployed
to Cloudflare as a Worker via `@opennextjs/cloudflare`, with Sanity Studio
hosted separately. No newsletter/email/payment integrations yet — those are
a later phase.

**Site purpose — read this before making priority calls.** cnf.sg is a
recruitment funnel, not a commerce or content platform. Flow: Google search
→ site (events/homepage) → Discord enquiry. Wiki/Team/long-form content
exist for member retention *after* joining, not acquisition. Every
high-visibility CTA should point to Discord (the live URL lives in
`siteSettings.discordUrl`, fetched via Sanity — never hardcode the Discord
invite string in a component) unless there's a specific reason otherwise.
No e-commerce or payment features planned short-term.

**Live URLs:**
- Site (production): https://cnf-sg.criticalsandfumbles.workers.dev
- Studio: https://cnf-website.sanity.studio

## Release History

**v0.1.10 — 2026-08-12 (branch `feat/code-of-conduct`, merged to
`main`).** Added a Code of Conduct section to the About page, positioned
directly after Philosophy and before Activities (`#code-of-conduct`
anchor, between `#philosophy` and `#activities`). New `codeOfConduct`
singleton schema (`sanity/schemas/codeOfConduct.ts`) — `introTagline`,
`tableExpectations` (numbered 1–10, each with a title + bullet points),
`safetyComfort` (object: heading/introText/tools/points), `diceRules`
(numbered 11–14, continuing the sequence rather than restarting).
**Content is sourced verbatim from an existing C&F document, not
generated** — seeded via `sanity/migrations/seed-code-of-conduct.ts`
(dry-run-first, same pattern as `patch-unit-labels.ts`), confirmed live
in Sanity before being wired into the page. Future edits to this content
should go through Studio, not be rewritten by a future session.

- Singleton enforcement follows this project's actual existing
  convention (`SINGLETON_TYPES` set + a pinned fixed-ID item in
  `sanity.config.ts`'s Studio structure, same as `philosophy`/
  `siteSettings`) — the request that prompted this feature initially
  proposed a schema-level `__experimental_actions` restriction instead,
  which isn't how any existing singleton in this project works; caught
  before writing the schema and built to match the real pattern instead.
- Component: `components/about/CodeOfConduct.tsx`. Table Expectations and
  Dice & Rules render as numbered cards (`rounded-lg border-emerald/40
  bg-surface`, matching `PhilosophyTier.tsx`'s card treatment for visual
  consistency with the section above). Safety & Comfort is deliberately
  *not* another numbered card — it's an emerald `border-l-4` callout
  (matching `CalloutBlock.tsx`'s existing treatment), since it's the most
  important section: tools render as `Badge` pills, and "Player comfort
  always outweighs narrative consistency" — which appears twice in the
  source content (once in the intro line, once as the closing bullet) —
  has its second occurrence visually promoted to its own emphasized line,
  since that repetition in the source signals it as the core message.
- All styling uses existing semantic theme tokens only (`emerald`,
  `surface`, `text-muted`, etc.) — no new colours, so dark/light
  correctness follows by construction, same reasoning as other
  no-screenshot-tool sessions this project.
- Bundle: 1355.26 → 1355.89 KiB gzip (+0.63 KiB) — negligible, no new
  dependencies.

**v0.1.9 — 2026-08-12 (branch `feat/og-images-r2`, merged to `main`).**
Resolved the Known Risks → Bundle size item that had been open since
Phase 1.4. Full architecture in "OG image generation (v0.1.9)" below —
summary: moved `next/og`'s WASM-based image rendering out of the main
site's Worker into a new standalone Worker (`workers/og-generator/`)
that pre-generates images on a Sanity webhook and stores them in a new
`cnf-website-og-images` R2 bucket; the main site now just reads them
back via an `OG_IMAGES_BUCKET` binding instead of rendering on-the-fly.
Bundle: 2138 → 1355 KiB gzip. Hit and fixed two real bugs along the way
(both documented in full in the architecture section): `@vercel/og`
hanging indefinitely outside Next.js's runtime (switched to `satori` +
`@resvg/resvg-wasm` directly), and the Sanity webhook firing on every
draft autosave instead of just publishes (fixed with a
`!(_id in path("drafts.**"))` filter). Prompted by the user's plan to
purchase `criticalsandfumbles.com` — a custom domain would unlock
serving R2 objects directly from Cloudflare's edge (skipping the Worker
entirely for image requests), but that part is deferred until the domain
is live; everything shipped this session works on `*.workers.dev` as-is.

**v0.1.7 — 2026-08-12 (branch `feat/world-page-infobox`, merged to
`main`).** Follow-up to v0.1.6 below, same day. User pointed the infobox
at `/wiki/titans-gate` (the World homepage) expecting to see it there too
and found nothing — correctly flagged as a scope gap, not a bug: v0.1.5/
v0.1.6 only wired the panel into the 9 detail/hub pages, never the World
homepage, even though it's a single-entity "article" page in exactly the
same shape (title, tagline, DM, description) as `worldUnit`. Confirmed
via AskUserQuestion that "all wiki articles" means every single-subject
page, not the 9 listing/index pages (`/wiki`, `/wiki/[world]/lore`,
etc.) — those stay plain card grids, an infobox needs one subject.

- New additive `lastEditedBy` field on the `world` schema (Step 0: no
  existing candidate — `world.dms` is a list of DMs, not a single
  "last edited" signal — so this mirrors the 6 schemas from v0.1.5
  rather than reusing `dms`).
- `WORLD_BY_SLUG_QUERY` gains `lastEditedBy` (its original `siblingWorlds`
  sub-query was replaced the same day — see v0.1.8 below).
- `/wiki/[world]/page.tsx` hero split into title/tagline/DM only; new
  top section pairs the description with the infobox, same layout fix
  as the worldUnit page in v0.1.6 (infobox beside the intro, not below
  the nav/sections).
- Panel shows `world.status` (active/hiatus/concluded) as its native
  status chip and `world.dms[0]` (first name only) as "Maintained by" —
  the full DM list stays in the hero band as before.
- Bundle: 2138.07 → 2138.22 KiB gzip, no new dependencies.

**v0.1.8 — 2026-08-12 (branch `feat/world-infobox-units`, merged to
`main`).** Same-day follow-up to v0.1.7. Direct feedback: linking to
sibling *worlds* from inside a single world's own infobox was less
useful than linking to that world's own units (Territories/Districts/
etc.) — matches how the `worldUnit` infobox's siblings already work
(same scope, not one level up). The World page's "siblings" list now
reuses the `units` array the page already fetches via `WORLD_UNITS_QUERY`
for the "Explore ___" grid below it (capped to 4), heading pluralized
via the same `pluralize()` helper used there. The `siblingWorlds` GROQ
sub-query and matching `World` type field from v0.1.7 were removed as
dead code rather than left unused. Bundle: 2138.22 → 2138.18 KiB gzip
(net negative — removed more than was added).

**v0.1.6 — 2026-08-12 (branch `fix/wiki-infobox-panel`, merged to
`main`).** Follow-up to v0.1.5 below, same day. The meta panel shipped
deliberately borderless/low-key per an earlier instruction ("keep the
right panel smaller and no big headers") — in practice that made it
unreadable/invisible on real content, especially the worldUnit hub page
where "Recent Entries" is currently empty (reported as "no right pane"
even though the server HTML was confirmed correct via curl — a genuine
visibility bug, not a missing-data one). User then asked for the wiki
pages to be more "reminiscent of Wikipedia or Fandom," scoped via
AskUserQuestion to just the infobox panel (not a full site reskin).
Changes:

- `WikiEntryMetaPanel` rebuilt as a proper infobox: bordered card
  (`border border-border bg-surface rounded-md`), a title bar showing the
  entry's own name, an image slot (whichever image field the type has —
  `portrait`/`coverImage`/`itemArt`/`banner`, all already selected by the
  existing GROQ queries, no query changes needed), and `<dl>`-style
  labeled key/value rows instead of freeform paragraphs. New required
  `title` prop, new optional `image` prop on all 9 call sites.
- Separately, the worldUnit hub page (`/wiki/[world]/[unit]`) had a
  second, structural problem: the panel was only wired into the page's
  *lower* "Recent Entries" section, far below the hero/map/nav — on a
  unit with no entries yet that put the panel completely disconnected
  from the title, effectively below the fold. Restructured: hero section
  now shows title/badge/DM only; a new top section right below it pairs
  the overview text with the panel in the two-column grid (matching
  where a real Wikipedia/Fandom infobox sits — beside the intro, not
  buried under later sections); "Recent Entries" reverts to a plain
  full-width section. The other 8 call sites didn't have this problem —
  their `<article>`/`<aside>` were already paired in one grid from
  v0.1.5.
- Bundle: 2138.05 → 2138.07 KiB gzip, no change of note, no new
  dependencies.

**v0.1.5 — 2026-08-12 (branch `feat/wiki-entry-meta-panel`, merged to
`main`).** Phase 1.5: wiki entry meta panel. Purely additive schema
change plus one shared component wired into 9 detail/hub pages. Highlights:

- New `lastEditedBy` field (`reference → teamMember`, optional) added to
  **6** schemas: `keyFigure`, `notablePlace`, `magicItem`, `faction`,
  `sessionLog`, `worldUnit`. **`loreEntry` deliberately excluded** — it
  already had a field with this exact name/shape from an earlier session;
  adding a second `lastEditedBy` definition to the same schema would have
  been an invalid duplicate field name. Found via a Step 0 investigation
  before writing any schema, as instructed.
- Step 0 also found existing Owner-candidate fields for 2 of the 7 types:
  `worldUnit.dmOwner` and `sessionLog.dm`. `keyFigure`/`notablePlace`/
  `magicItem`/`faction` have no teamMember reference at all — their meta
  panel's "Maintained by" row is simply omitted, no new field added (this
  was explicitly ruled out in the request). `loreEntry` had two candidates
  (`lastEditedBy`, `submittedBy`) — user chose `lastEditedBy`, which means
  loreEntry's "Maintained by" and "Last updated by" rows now source the
  same field/person; a known, accepted redundancy, not a bug.
- `components/wiki/WikiEntryMetaPanel.tsx` — one shared component, 9 call
  sites (not 7 — `loreEntry` and `sessionLog` each have both a world-scoped
  and a unit-scoped detail page, both needed the panel). Right-rail on
  desktop (`lg:grid-cols-[1fr_240px]`), stacks above the footer below that
  breakpoint. Small/subtle by design (no big headers) — the wiki entry
  content stays the dominant visual element, per explicit direction.
- All 9 detail/hub pages restructured from a single centered
  `max-w-3xl`/`max-w-6xl` column into a two-column grid to make room for
  the rail — real layout change, not just filling pre-existing whitespace
  (that "whitespace" didn't structurally exist before this session; see
  Lessons learned below for the full flag-before-proceeding writeup).
- `worldUnit`'s panel shows aggregate counts (keyFigures/notablePlaces/
  magicItems/factions/loreEntries/sessionLogs scoped to that unit, zero
  counts filtered out) instead of a single status chip, and "siblings" are
  other `worldUnit`s in the same world (not sibling entries within
  itself — that's what the pre-existing "Recent Entries" section already
  shows; a separate panel section duplicating it would be redundant).
- `faction`/`loreEntry`/`sessionLog` show no status chip (row #1) — none
  of the three has a genuine status-ish field; the request's own examples
  only named `worldUnit.developmentStatus`/`keyFigure.status`+
  `threatLevel`/`notablePlace.dangerLevel`/`magicItem.rarity`.
  `loreEntry.canonStatus` exists but wasn't listed — not added, since it's
  already shown via `CanonBadge` directly on the page.
- New shared "In this unit"/"In this world" GROQ fragment
  (`wikiSiblingEntries` in `sanity/lib/queries.ts`) — deliberately named
  `siblingEntries` in every query, **not** `relatedEntries`, to avoid
  colliding with `loreEntry`'s pre-existing, manually-curated
  `relatedEntries` reference array field (a different, editor-curated
  concept). `lib/wikiLinks.ts`'s `wikiSiblingHref()` builds the correct
  URL per `_type` — reused by every call site rather than duplicated.
- First-name-only display (`firstName()` helper in the component, splits
  on whitespace) applied everywhere this feature shows a person's name,
  per explicit instruction — never a full name or email. The pre-existing
  "Last edited by {full handle}" line on both loreEntry detail pages
  (world- and unit-scoped) was removed as a follow-up once shipped — it
  duplicated the panel's own "Last updated by {first name}" row using the
  same field. `justify-between` → `justify-end` on that footer row since
  it's back down to a single element ("Suggest an edit").
- Bundle size: 2134.59 → 2137.87 KiB gzip (+3.3 KiB) — negligible, no new
  npm dependencies added, well within the Known Risks budget below.

**Branch/tag status, corrected 2026-08-11 (late).** A prompt this session
referred to "v0.1.2 tag details" as already recorded/merged — verified via
`git tag -l` and `git log main`, and that's not accurate: **no `v0.1.2`
tag exists** (only `v0.1-pre-mvr` and `v0.1.1` are real tags), and
**neither `feat/wiki-unit-architecture` nor `feat/seo-and-discord-funnel`
has been merged to `main`** — `main`'s tip is still `f457840` (the
pre-Phase-1.3 CLAUDE.md accuracy fix). The `unitLabel` patches and
`statBlock.alignment` field described below are real and committed, but
only on those two still-open, unmerged, stacked branches. Don't treat the
"v0.1.2"/"v0.1.3" labels in this doc as git tags — they're informal
version labels for this doc's own bookkeeping, not `git tag` output.

**v0.1.4 — 2026-08-11 (branch `feat/hero-eyebrow`, not yet merged; stacked
on `feat/seo-and-discord-funnel`, itself stacked on
`feat/wiki-unit-architecture`).** Small isolated addition: an eyebrow line
above the "Criticals & Fumbles" title in `components/home/Hero.tsx` — a
16px outline d20 icon (`var(--color-emerald)`) + "Singapore's Tabletop RPG
Community" (Space Mono, uppercase, letter-spaced,
`var(--color-text-muted)`). Wrapped together with the `<h1>` in its own
`gap-2` flex column (tighter than the hero's outer `gap-6` rhythm) so the
eyebrow sits close to the title specifically, not spaced like the other
hero elements. Nothing else in Hero.tsx touched. Uses only theme-aware
semantic classes (`text-emerald`/`text-text-muted`), so dark/light
correctness follows from the existing CSS variable system by construction
— confirmed the markup renders correctly via dev server output, but no
actual screenshot was taken (no browser/screenshot tool available this
session).

**v0.1.3 — 2026-08-11 (branch `feat/seo-and-discord-funnel`, not yet
merged).** Phase 1.4: SEO + Discord funnel. See "SEO & Discord funnel"
section below for the full breakdown. Highlights:

- `lib/metadata.ts`'s `buildMetadata()` helper — every dynamic page now
  exports `generateMetadata` using it (events, articles, team, wiki world/
  lore/session detail); static pages (home, events index, about) export a
  plain `metadata` const with it instead
- Dynamic Open Graph images via `next/og`'s `ImageResponse` — a branded
  site-wide fallback (`/og-default`) and a per-event generated image
  (`opengraph-image.tsx`, prefers the event's real splash/cover photo when
  set). **No static `/public/og-default.png` exists** — deviated from the
  literal spec since there was no image-generation tool available; used
  the spec's own sanctioned ImageResponse fallback approach instead
- Schema.org structured data: `EventStructuredData`, `ArticleStructuredData`,
  site-wide `OrganizationStructuredData` (in the root layout, `sameAs`
  populated live from `siteSettings.socialLinks` + `discordUrl`)
- `app/sitemap.ts` + `app/robots.ts`
- `siteSettings.socialLinks` platform enum gained `"Facebook"` (additive
  — existing `Twitter/Instagram/YouTube/Twitch/TikTok` values untouched);
  Facebook URL seeded via a dry-run-first patch script. **Discord is
  deliberately not added to `socialLinks`** — it already has its own
  `discordUrl`/`discordServerName` fields, which predate this session and
  were reused instead of duplicating
  - Facebook: `https://www.facebook.com/criticalsandfumbles/`
  - Instagram was already seeded (`https://www.instagram.com/criticalsandfumbles/`)
- Footer's contact-email link removed from the rendered page —
  **`siteSettings.contactEmail`'s schema field and stored value are
  untouched**, display-only change (see Lessons learned re: schema safety)
- Discord CTAs added: homepage Hero (secondary button next to "Explore the
  Archive"), events index page (CTA band above the footer), event detail
  pages ("Questions? Ask us on Discord" — beside Register if it has a URL,
  in its place if not). Footer already had a prominent Discord button from
  an earlier session — left as-is, it already satisfied this requirement
- Facebook/Instagram/Discord icons added to desktop nav and the mobile
  drawer (`components/icons/SocialIcons.tsx`, shared — not duplicated
  between `Nav.tsx` and `Hero.tsx`)
- **Part B (share buttons) explicitly skipped this session** — the spec
  itself deprioritized it ("build last or skip if time-constrained"; the
  session prioritized Parts A/C/D/E/F, all of which shipped)
- Worker bundle: jumped from ~1.10 MB to **~2.08 MB gzipped** — `next/og`'s
  `ImageResponse` (WASM-based image rendering) is the dominant cause. Still
  under the 3 MiB free-tier limit but headroom is now ~0.9 MB, not ~1.9 MB.
  Flagged to and confirmed by the user before proceeding — watch this if
  adding more bundle weight in future sessions

**v0.1.2 — 2026-08-11 (branch `feat/wiki-unit-architecture`, not yet merged).**
Phase 1.3: wiki unit architecture + stat blocks. Purely additive — see
"Wiki unit architecture" section below for the full breakdown. Highlights:

- New `worldUnit` document type (world-agnostic; each `world` has a
  `unitLabel` field for what it calls its subdivisions — Territory/
  District/Sector/Fragment)
- 4 new entry-type schemas scoped to a unit: `keyFigure` (with an optional
  D&D 5e stat block), `notablePlace`, `magicItem` (with optional
  mechanical stats), `faction`
- `loreEntry` and `sessionLog` both gained an optional `unit` reference
  (existing world-level `/wiki/[world]/lore` and `/sessions` pages are
  unaffected — they don't filter on it)
- New nested route tree: `/wiki/[world]/[unit]` and 5 index+detail page
  pairs underneath it (lore, figures, places, items, factions), plus
  unit-scoped lore/sessions
- `dmNotes` (private Portable Text) on all 4 new entry types — never
  selected in any public GROQ query, verified by grep before shipping
- Worker bundle: ~1.10 MB gzipped as of v0.1.2 — **stale, see Known Risks
  → Bundle size** for the current figure (this grew substantially in the
  very next release, v0.1.3)

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
- Worker bundle: ~1.09 MB gzipped as of v0.1.1 (was 0.86 MB at the
  original scaffold baseline, grew with the Hero RSS feed panel) — **this
  figure is stale**, see Known Risks → Bundle size for the current,
  substantially higher number
- Base font size 18px, custom body-text scale — tuned for 4K displays
  (done, not outstanding)

Known TODOs (not started):
- Visual Editing — mentioned in a consolidation request but not yet scoped
  anywhere in this repo's history; needs a real spec before starting
- Newsletter integration (Phase 2) — static "coming soon" UI only right now

## Known Risks

### Bundle size — RESOLVED (as of v0.1.9, 2026-08-12)

**Current: ~1.36 MB gzip / 3 MiB free-tier limit (45% used). Headroom
restored to ~1.7 MB.** This is the authoritative current figure — bundle
size numbers quoted inside Release History entries below are point-in-time
snapshots from when each release shipped, not live state; this section is
what to check before adding anything.

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

| Name | Slug | Colour accent | `unitLabel` |
|---|---|---|---|
| Titan's Gate | `titans-gate` | `#8B2FC9` | Territory |
| Temasek Tales | `temasek-tales` | `#C4692A` | District |
| SingaporeZ | `singaporez` | `#2C5F8A` | Sector |
| Shattered Tales | `shattered-tales` | `#6B3FA0` | Fragment |

All four confirmed live via `sanity/migrations/patch-unit-labels.ts`
(2026-08-11) — `initialValue` in the schema only applies to new documents
created in Studio, it never backfills existing ones, so all 4 world
documents had `unitLabel` genuinely unset until this ran.

## Sanity schema summary

All schemas live in `sanity/schemas/`, registered in `sanity/schemas/index.ts`.
Three singletons (`siteSettings`, `philosophy`, `codeOfConduct`) pinned in
the Studio structure (`sanity.config.ts`'s `SINGLETON_TYPES` set + a fixed-ID
list item each) so editors can't create duplicates — this is the only
singleton mechanism used in this project; none of the three schemas
themselves set `__experimental_actions`. Fifteen document types: `world`,
`worldUnit`, `teamMember`, `article`, `regularEvent`, `majorEvent`,
`loreEntry`, `sessionLog`, `keyFigure`, `notablePlace`, `magicItem`,
`faction`, `organisation`, `resource`, `galleryPhoto`. One reusable object:
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

- CSV export per world unit (future phase, not scoped yet)
- Fight Club 5e XML compendium export per world unit (future phase) — the
  `keyFigure.statBlock` field names already mirror the XML element names
  1:1 for this; see "Wiki unit architecture" below
- Part B (share buttons) from Phase 1.4 — explicitly deprioritized/skipped
  this session (see Release History v0.1.3); build `ShareButtons` and add
  to events/articles/wiki-lore detail pages when there's time
- Fix the `opengraph-image.tsx` precedence caveat noted in "SEO & Discord
  funnel" above, if the per-event *generated* fallback image (vs. the
  generic site fallback) turns out to matter in practice
- **Manual, non-code steps for the site owner** (not something Claude Code
  can do):
  - Submit `/sitemap.xml` to Google Search Console
  - Create a free Google Business Profile for "Criticals and Fumbles"
  - Test share previews at https://www.opengraph.xyz/ and Facebook's
    Sharing Debugger once this branch is live
  - Send a test link to yourself on WhatsApp to verify its preview
- (the homepage "Latest Updates" activity feed, previously tracked here as
  a TODO, shipped as the Hero panel — see HeroRightPanel and Release
  History above)

## Wiki unit architecture (Phase 1.3)

Each world is subdivided into DM-owned zones — the `worldUnit` document
type. Deliberately world-agnostic in the schema (never call anything
"location" in code) — each `world` document has a `unitLabel` string field
for what that world *calls* its subdivisions in the UI (Territory/
District/Sector/Fragment are the four current values — free text,
editor-renamable in Studio at any time; see "The four worlds" table above
for current values). `worldUnit` has `developmentStatus`
(draft/in-progress/established/canonical) driving the badge and
draft-greyed-out treatment on `WorldUnitCard`.

**`unitLabel` is pluralized for the "Explore ___" heading** on the world
page (`app/(site)/wiki/[world]/page.tsx`) via a small local `pluralize()`
helper (consonant+y → "-ies", e.g. "Territory" → "Territories", "City" →
"Cities"; otherwise appends "s"). Bug fixed 2026-08-12: this used to be a
naive `{unitLabel}s` template producing "Territorys" — found when an
editor tested renaming Titan's Gate's `unitLabel` to "Kingdom" and back.
Not a full pluralization library — covers realistic label values, not
every irregular English plural.

**Four entry-type schemas, each with an optional `unit` reference** (plus
`world`): `keyFigure` (NPCs — status/threatLevel/faction, optional D&D
stat block), `notablePlace` (dangerLevel, associated keyFigures/items),
`magicItem` (rarity, optional mechanical stats, currentHolder/foundAt
refs), `faction` (members are keyFigure refs). All four also have a
`dmNotes` Portable Text field — **private, never selected in any public
GROQ query** (verified by grepping `queries.ts` for `dmNotes` before
shipping — it only appears in comments explaining the exclusion).

`loreEntry` and `sessionLog` (pre-existing types) both gained an optional
`unit` reference field, added specifically to make
`/wiki/[world]/[unit]/lore` and `/sessions` genuinely filterable — the
existing world-level `/wiki/[world]/lore` and `/sessions` pages/queries
are untouched and unaffected (they don't filter on `unit` at all, so
entries with or without a unit set still show up there exactly as before).

### Stat blocks (XML-export-ready, export not built)

`keyFigure.hasStatBlock` (boolean) gates a `keyFigure.statBlock` object
whose field names are a deliberate 1:1 mirror of the Fight Club 5e XML
`<monster>` element (`ac`, `hp`, `speed`, `str`/`dex`/`con`/`int`/`wis`/
`cha` under `abilities`, `cr` → `challengeRating`, etc.) so a future export
script can map straight across with no field renaming. **No export
tooling exists yet — only the schema and the `StatBlockCard` display.**
`statBlock.alignment` (added 2026-08-11, after the initial gap was flagged
and caught) matches the Fight Club XML `<alignment>` element — distinct
from any narrative alignment a keyFigure might have elsewhere; this one is
specifically for the export-mapped stat block. `magicItem.hasMechanics`
gates a simpler `magicItem.mechanics` object (type/attunement/effect
text), displayed via `ItemMechanicsCard` — not XML-mapped, just a
consistent display pattern.

Both stat display cards (`components/wiki/StatBlockCard.tsx`,
`ItemMechanicsCard.tsx`) render on a **fixed dark background
(`#1a1a1a`, not a theme token — always dark regardless of site theme)**,
using the same fixed `on-forest`/`on-forest-muted` text tokens as the
Hero/PhilosophyStrip panels (see Design system above), since the card's
background doesn't flip with the theme.

### URL structure

```
/wiki/[world]/[unit]                         Unit homepage
/wiki/[world]/[unit]/lore(/[slug])           Unit-scoped lore
/wiki/[world]/[unit]/figures(/[slug])        Key Figures (NPCs)
/wiki/[world]/[unit]/places(/[slug])         Notable Places
/wiki/[world]/[unit]/items(/[slug])          Magic Items
/wiki/[world]/[unit]/factions(/[slug])       Factions
/wiki/[world]/[unit]/sessions(/[slug])       Unit-scoped session logs
```

`WorldUnitNav` (new, mirrors `WorldNav`'s tab pattern) drives the sub-nav
on all of these. Unit-scoped lore/sessions use their own card components
(`UnitLoreCard`, `UnitSessionCard`) rather than the existing `LoreCard`/
`SessionCard` — those hardcode the two-segment `/wiki/[world]/lore/...`
href shape, and modifying them to support both URL shapes would have
touched a component used by the pre-existing world-level pages, which
this session was scoped to leave alone.

`mapImageUrl` (large/high-res maps hosted externally on R2, as an
alternative to the Sanity `mapImage` field for images under 500KB) renders
via a plain `<img>`, not `next/image` — its domain isn't and shouldn't be
added to `next.config.ts`'s `remotePatterns` just for this.

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
  (see Release History) — reuse rather than duplicate if adding more image
  generation elsewhere

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
verified by re-fetching the live document afterward (see Lessons learned).

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

**Repo structure note:** `workers/` is excluded from the root
`tsconfig.json` and `eslint.config.mjs` — it's a fully separate npm
project with its own `node_modules`/toolchain, not part of the Next.js
app's type-check or lint scope. `@cloudflare/workers-types` was added as
a devDependency to the **main** project (not `workers/og-generator`,
which has its own) purely so `cloudflare-env.d.ts` can reference
`R2Bucket`.

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
  `loreEntry`, `sessionLog`, `teamMember`, `worldUnit`, `keyFigure`,
  `notablePlace`, `magicItem`, `faction`, newest `date` first, capped at 5.
  Items past index 2 are hidden below the `md` breakpoint (3 items on
  mobile, 5 from tablet up) via a per-item `hidden md:flex` class, not a
  separate query/prop.

  **Bug fixed 2026-08-12:** the 5 Phase 1.3 wiki types (`worldUnit` +
  the 4 unit-scoped entry types) were never added to `HOME_RSS_FEED_QUERY`
  when Phase 1.3 shipped — that query predates them, from the earlier
  Phase 1.1 session. Editing/creating a `worldUnit` (or any entry type)
  silently never appeared in "Latest Updates". Fixed by adding a subquery
  + `typeConfig`/`itemHref` case for each. If a 6th wiki content type is
  ever added, remember to wire it into **all** of: the `HOME_RSS_FEED_QUERY`
  subquery, `RssFeedItem`'s `_type` union and `RssFeedData` in
  `sanity/lib/types.ts`, the merge array in `app/(site)/page.tsx`, and
  `typeConfig`/`itemHref` in `HeroRightPanel.tsx` — missing any one of
  these fails silently (item just doesn't show, or throws if `typeConfig`
  lookup is missing since `RssItem` doesn't guard against an unknown
  `_type`).

  `worldUnit` items show the world's actual `unitLabel` (fetched per-item
  as `"unitLabel": world->unitLabel`) as their badge text, not a hardcoded
  "Territory" — labels are per-world and editor-renamable (see Wiki unit
  architecture below), so a static label would be wrong for any world
  that doesn't use "Territory".

  **`article`'s date field, fixed 2026-08-12:** every other type in this
  feed orders/dates by `_updatedAt` (any edit resurfaces it), but the
  `articles` subquery used `coalesce(publishedAt, _updatedAt)` — since
  `publishedAt` is set once and normally never changes, editing an
  already-published article's title/body afterward did **not** move it in
  "Latest Updates" or update its shown date, even though `_updatedAt` had
  genuinely changed. Changed to plain `_updatedAt` so any edit resurfaces
  the article, matching every other type in this feed. **Deliberately not
  applied to `ARTICLES_QUERY`/`HOME_LATEST_ARTICLES_QUERY`** (the
  `/articles` listing page and homepage article strip) — those should stay
  ordered by publish date, not edit date, so fixing a typo on an old
  article doesn't reshuffle it to the top of the reading list. Only this
  feed's "recent activity" framing wants edit-date ordering. `sessionLog`
  has the identical `coalesce(sessionDate, _updatedAt)` pattern and the
  same latent issue — not fixed, wasn't asked for, flagged here for when
  it comes up.

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

**"Flag data loss/structural issues before proceeding" caught 3 real
problems on one feature (wiki entry meta panel, v0.1.5).** Investigating
before writing schema/component code, rather than implementing a spec
literally, found: (1) the spec's schema-change list included `loreEntry`,
which already had a field with the exact name being "added" — would have
been an invalid duplicate field definition; (2) the spec said "seven call
sites" for one shared component, but `loreEntry`/`sessionLog` each have
two detail pages (world-scoped and unit-scoped) — actually nine; (3) the
spec's premise ("site has room... fills the whitespace") didn't match the
actual current layout of the affected pages, which were single centered
columns with no existing sidebar slot — implementing the panel required a
real two-column restructuring of all 9 pages, not just dropping a
component into empty space. None of these were visible without reading
the actual current schema/page files first. General takeaway: when a spec
describes existing repo state ("X already has Y," "N call sites," "there's
room for Z"), verify that description against the actual files before
implementing — specs can be wrong about the codebase's current shape even
when the *feature intent* is completely clear and correct.

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

**`SANITY_API_WRITE_TOKEN`** — added to `.env.local` on 2026-08-11 (Editor
role) for `sanity/migrations/patch-unit-labels.ts`. Not in
`.env.local.example` since it's not required for normal dev/build — only
for running a write-access migration script. Server/script-only, never
client-side; never commit the actual value.

## Migration scripts

`sanity/migrations/` — one-off data-patch scripts, run manually via
`npx tsx sanity/migrations/<name>.ts`. Not a generic runner/framework —
each script is purpose-built for its one patch, following a dry-run-first
pattern: defaults to logging proposed changes only, real writes require
`DRY_RUN=false`. Requires `SANITY_API_WRITE_TOKEN` in `.env.local` (see
Environment variables below). Always read the dry-run output before
re-running with `DRY_RUN=false`.

- `patch-unit-labels.ts` (2026-08-11) — set `unitLabel` on all 4 `world`
  documents (Territory/District/Sector/Fragment), since the schema's
  `initialValue` never backfills pre-existing documents. Already run; kept
  as a record and a template for the next one-off patch.
- `patch-social-links.ts` (2026-08-11) — appends a Facebook entry to
  `siteSettings.socialLinks` (uses `.append()`, not `.set()` — existing
  entries, including a stray empty one, are preserved untouched). Skips
  with a message if a Facebook entry already exists, so it's safe to
  re-run. Already run.

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
