# Release History

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved. See root
`CLAUDE.md`'s module index for when to read this (reference only, rarely
needed).

## Release History

**v0.1.15 — 2026-08-19 (branch `chore/studio-structure-reorganization`).**
Studio desk structure reorganised into folders (Main > Events/Team/Wiki/
Settings, plus a Campaigns placeholder for a future subsite) — pure
Studio navigation change, **no schema files touched** (confirmed via
`git diff main --stat`: only `sanity.config.ts` + new `sanity/structure.ts`).
Full breakdown in `docs/schemas.md` § Studio desk structure. One gap
caught before implementing: `organisation` existed but wasn't mentioned
anywhere in the session's structure plan — placed top-level alongside
`article`/`resource`/`galleryPhoto` after confirming with the user.
`Campaigns` folder is an intentional empty placeholder, not tracked as a
known-risk (documented future work, not a currently-open gap).

**v0.1.14 — 2026-08-18 (branch `feat/ai-charter-and-about-tabs`).** New
`aiCharter` singleton schema + About page restructured from one long
scroll into 5 tabs (About / Philosophy / Divisions / Code of Conduct /
AI Charter). Full component/architecture breakdown in `docs/components.md`
§ About page tabs — highlights:

- **Schema deviation caught before writing it, again:** the request's
  literal `aiCharter` schema spec included `__experimental_actions:
  ['update', 'publish']` for singleton enforcement — the same deviation
  CLAUDE.md's release history already caught once before for
  `codeOfConduct` (v0.1.10): this project's actual singleton mechanism is
  `SINGLETON_TYPES` (a `Set` in `sanity.config.ts`) + a pinned fixed-ID
  Studio structure item, and none of the existing singletons set
  `__experimental_actions` on the schema itself. Built `aiCharter` to
  match the real pattern instead — added to `SINGLETON_TYPES` and given a
  pinned `S.listItem()` in the Studio structure, no
  `__experimental_actions` field.
- `aiCharter` fields: `intro` (Portable Text), `principles` (array of 7
  inline objects — `number`/`title`/`body`[Portable Text]/`pullQuote`),
  `closingStatement` (Portable Text). Content sourced verbatim as
  provided by the user, not generated — seeded via
  `sanity/migrations/seed-ai-charter.ts` (dry-run-first, same pattern as
  `seed-code-of-conduct.ts`), confirmed live before being wired into the
  page.
- **Content gap in the tab spec, caught before implementing:** the
  original 5-tab plan didn't account for the pre-existing `#activities`
  section (`siteSettings.activities` pills) — every other existing About
  page section mapped cleanly to one of the 5 tabs, this one didn't.
  Confirmed with the user: folded into the "About" tab alongside
  Vision/Mission/History/Organisations.
- **Tab render approach:** all 5 tabs' content renders into the initial
  server-rendered HTML (data fetched server-side in the async page
  component, same as before), visibility toggled client-side via a CSS
  `hidden` class rather than conditional mounting — keeps AI Charter and
  Code of Conduct content (both worth indexing) crawlable by bots that
  don't execute JS.
- **Tab state is hash-based** (`/about#philosophy`, `/about#ai-charter`),
  not `?tab=` search params — matches the one pre-existing internal link
  (`PhilosophyStrip.tsx` → `/about#philosophy`) with no changes needed
  there, and avoids a Next.js navigation round-trip on every tab switch.
- "Feelings" → "Feelings & Behaviours" is a **display label change only**
  in `page.tsx` — the underlying `philosophy.behaviours` Sanity field and
  `BehavioursTier` component/prop names are untouched.
- New components: `components/about/AboutTabs.tsx` (tab switcher),
  `components/about/AiCharter.tsx` (display), `components/about/
  AboutIntro.tsx` and `components/about/DivisionsGrid.tsx` (existing
  inline JSX extracted into their own components so every tab has one,
  matching the pattern of the pre-existing `PhilosophyTier`/
  `CodeOfConduct` components).
- Bundle: 1358.30 → 1359.79 KiB gzip (+1.49 KiB) — negligible, no new
  dependencies.

**v0.1.13 — 2026-08-14 (branch `feat/regular-event-registration-url`).**
`regularEvent` gains an optional `registrationUrl` field (`url`, additive
— `majorEvent` already had this), so recurring sessions can now link to
external registration too, not just Discord. Button logic across all
three surfaces (`EventCard.tsx`/`/events`, `EventStrip.tsx`/homepage,
`RegularEventDetail` in `app/(site)/events/[slug]/page.tsx`) now checks
`registrationUrl` presence directly rather than gating on event `_type` —
previously `EventStrip`'s CTA logic only ever showed "Register" for
`majorEvent` even though the underlying button/link plumbing was already
type-agnostic. Falls back to "View Details" (internal link) when unset,
same as `majorEvent`. Verified live: temporarily patched the one existing
`regularEvent` document's `registrationUrl` via a scratch script, confirmed
the Register button + correct external href render on all three surfaces,
then unset it and confirmed the View Details fallback returns — script
deleted after, not committed. Bundle: 1358.40 → 1358.38 KiB gzip (flat, no
new dependencies). Schema deployed via `npx sanity deploy`.

**v0.1.12 — 2026-08-14 (branch `feat/events-fixes-divisions-roles`, merged
to `main`).** Events bugfixes + new `division` schema + additive roles
expansion.

- **Events fixes:**
  - Homepage "Upcoming Events" scope change: was `majorEvent`-only by
    deliberate original design (see v0.1.1's `HOME_UPCOMING_EVENTS_QUERY`);
    now merges `majorEvent` + `regularEvent`, capped at 3 combined, sorted
    by a per-type `sortDate` (`startDate` for majorEvent, `startedDate` for
    regularEvent — the only schedule-relevant field regularEvent has; no
    "next occurrence" field exists). Merge+sort happens client-side in
    `app/(site)/page.tsx`, same pattern as the Hero RSS feed. New
    `HomeUpcomingEvent`/`HomeUpcomingEventsResult` types.
    `EventStrip.tsx` shows an amber status badge for majorEvent, a plain
    "Regular Session" emerald badge for regularEvent.
  - Regular event cards were completely unclickable on `/events`
    (`EventCard.tsx` was a bare `<div>`, no `<Link>`/`<a>` at all — not a
    missing-slug issue, the one existing `regularEvent` document has a
    valid slug). Fixed by wrapping content in a `<Link>`.
  - Deeper bug found investigating the above: `/events/[slug]/page.tsx`
    only ever queried `majorEvent` (`MAJOR_EVENT_BY_SLUG_QUERY`) — even
    after fixing the `<Link>`, a regularEvent slug would 404. Fixed with a
    type-aware fetch: try `majorEvent` first, fall back to
    `REGULAR_EVENT_BY_SLUG_QUERY`; split into two render components
    (`MajorEventDetail`, `RegularEventDetail`) in the same file, since the
    two schemas' field shapes genuinely diverge (`regularEvent.schedule` is
    a plain string; `majorEvent.schedule` is Portable Text — same field
    name, incompatible types, can't share one render path for that field).
    `RegularEventDetail` is deliberately simpler — no
    registration/countdown/gallery/related-events sections, since
    regularEvent has none of those concepts.
  - Register/View Details button added to event cards on both the homepage
    strip and `/events` (`MajorEventCard`, `EventCard`, `EventStrip`) —
    `registrationUrl` set → external "Register" button; unset → internal
    "View Details" link. `regularEvent` has no `registrationUrl` field at
    all, so its cards always show "View Details". Cards were restructured
    (outer `<div>` + inner content `<Link>` + sibling button `<LinkButton>`)
    to avoid nesting an `<a>` inside another `<a>`, which the previous
    whole-card-is-a-`<Link>` pattern would have produced once a real button
    was added.
- **New `division` schema** (`sanity/schemas/division.ts`) — additive,
  purely new document type: `name`, `slug`, `logo`, `blurb`,
  `colourAccent`, `order`. Seeded with the 3 real C&F divisions (DM &
  Story Group / Project Wing / Art House) via
  `sanity/migrations/seed-divisions.ts` (dry-run-first, idempotent —
  skips by `name` match). `About` page's `DivisionCard` was previously
  **hardcoded** (icon emoji + name + description passed as props from
  `app/(site)/about/page.tsx`) — now fetches via `DIVISIONS_QUERY` and
  renders the real `logo`/`blurb`/a live member count
  (`count(*[_type == "teamMember" && division._ref == ^._id])`). No logo
  images uploaded yet — `DivisionCard` falls back to a 🎲 emoji when
  `logo` is unset.
- **`teamMember.division`** — new optional reference field (→ `division`),
  purely additive, no other `teamMember` field touched. `TEAM_MEMBERS_QUERY`
  now resolves it; `CharacterCard.tsx` shows a division badge (using
  `division.colourAccent` if set, same inline-`style` pattern as
  `WorldCard.tsx`'s accent colour — not routed through the shared `Badge`
  component, which doesn't take a colour override) only when the field is
  set — no empty/placeholder badge otherwise.
- **`teamMember.roles` — 8 new options added, all 9 existing untouched:**
  Narrator, Storyteller, Loremaster, Apprentice, Curator, Maestro, Crafter,
  Smith. Pure additive change to the shared `TEAM_MEMBER_ROLES` array in
  `sanity/schemas/constants.ts` — **not two separate edits.** The request
  assumed a schema options list *and* a separate `roleDisplay` map in
  `CharacterCard.tsx` needed updating; in this codebase `CharacterCard`'s
  `ROLE_LABELS` is derived directly from `TEAM_MEMBER_ROLES`
  (`Object.fromEntries(TEAM_MEMBER_ROLES.map(...))`), so extending the one
  array updates both the Studio options and the display label
  automatically. No migration script — verified via a live Vision-style
  query (all 10 team members' `roles` arrays) before and after the schema
  change; both runs returned byte-identical data, confirming the additive
  change touched zero documents.
- Studio schema deployed (`npx sanity deploy`).
- Bundle: 1355.89 → 1358.40 KiB gzip (+2.51 KiB) — negligible, no new
  dependencies. **Note:** the session's original brief cited a "~2.08 MB
  gzip baseline" for this check — that figure is stale (the peak before
  v0.1.9's OG-image fix); current baseline per Known Risks below is
  ~1.36 MB gzip.
- **Custom domain confirmed live, `NEXT_PUBLIC_SITE_URL` updated.** A
  file-level check (`.env.local`, `wrangler.toml`) initially found no
  evidence of `criticalsandfumbles.com` being bound — correctly so,
  since Cloudflare's **Custom Domains** feature is configured entirely
  in the dashboard and never appears in `wrangler.toml`'s `routes` block
  (a separate mechanism). Verified directly via the Workers Domains API
  instead: both `criticalsandfumbles.com` and `www.criticalsandfumbles.com`
  are bound to the `cnf-sg` Worker (production environment), enabled,
  with active SSL certs — both resolve live with `200`, no redirect
  between apex/www (Cloudflare doesn't enforce either as canonical; that's
  an app-level choice). `cnf.sg` is **not** a registered zone on this
  account and doesn't resolve at all — not "deprecated," just never live.
  `NEXT_PUBLIC_SITE_URL` in `.env.local` was still the old `*.workers.dev`
  URL despite the domain being bound at the infra level — updated to
  `https://www.criticalsandfumbles.com` (www chosen since it's what the
  brief's original ideation intended; apex works identically if that
  changes). Verified via dev server that `robots.txt`, `sitemap.xml`, and
  the homepage's canonical `<link>` all now emit the new domain — nothing
  else in the codebase hardcoded the old `workers.dev` URL, it all flows
  from this one env var. **`.env.local` is gitignored, local-only** — the
  matching `NEXT_PUBLIC_SITE_URL` value in Cloudflare's Workers Builds
  dashboard settings (Settings → Environment Variables, see Cloudflare
  deployment below) also needs updating for the production auto-deploy to
  pick this up; that's a dashboard-only step, not doable from this repo.

**v0.1.11 — 2026-08-12 (branch `feat/unit-infobox-browse-links`, merged
to `main`).** Small follow-up to the wiki infobox work: added a "Browse"
section to the worldUnit hub page's infobox (Lore / Key Figures /
Notable Places / Magic Items / Factions), always shown regardless of
whether each category has content yet — the existing `counts` display
only shows non-zero categories, which meant a freshly-created unit like
Stonemount showed nothing at all to navigate by. New optional
`categoryLinks` prop on `WikiEntryMetaPanel` (worldUnit-only; no other
entry type passes it), rendered between the info rows and the "In this
world" siblings list. `WorldUnitNav` already links to the same 5 pages
lower on the page — this doesn't replace that nav, just surfaces the
same links higher up, in the infobox. Bundle: 1355.89 → 1356.35 KiB gzip
(+0.46 KiB).

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
Phase 1.4. Full architecture in "OG image generation (v0.1.9)" (see
`docs/seo-and-infra.md`) — summary: moved `next/og`'s WASM-based image
rendering out of the main site's Worker into a new standalone Worker
(`workers/og-generator/`) that pre-generates images on a Sanity webhook
and stores them in a new `cnf-website-og-images` R2 bucket; the main site
now just reads them back via an `OG_IMAGES_BUCKET` binding instead of
rendering on-the-fly. Bundle: 2138 → 1355 KiB gzip. Hit and fixed two real
bugs along the way (both documented in full in the architecture section):
`@vercel/og` hanging indefinitely outside Next.js's runtime (switched to
`satori` + `@resvg/resvg-wasm` directly), and the Sanity webhook firing on
every draft autosave instead of just publishes (fixed with a
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
  `docs/lessons-learned.md` for the full flag-before-proceeding writeup).
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
  npm dependencies added, well within the Known Risks budget (see
  `docs/seo-and-infra.md`).

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
(`docs/seo-and-infra.md`) for the full breakdown. Highlights:

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
  untouched**, display-only change (see `docs/lessons-learned.md` re:
  schema safety)
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
"Wiki unit architecture" (`docs/wiki-architecture.md`) for the full breakdown. Highlights:

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
  → Bundle size** (`docs/seo-and-infra.md`) for the current figure (this
  grew substantially in the very next release, v0.1.3)

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
  since the underlying document values were already consistent (see
  `docs/lessons-learned.md`).
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
  (see `docs/seo-and-infra.md`)

**v0.1-pre-mvr — 2026-08-10.** Consolidation baseline before further feature
work; tagged at commit `42d6cdc`. What's actually in it:

- Full site scaffold deployed to Cloudflare as a Worker (`cnf-sg`, via
  `@opennextjs/cloudflare` — see `docs/seo-and-infra.md`; not Pages)
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
  figure is stale**, see Known Risks → Bundle size (`docs/seo-and-infra.md`)
  for the current, substantially higher number
- Base font size 18px, custom body-text scale — tuned for 4K displays
  (done, not outstanding)

Known TODOs (not started):
- Visual Editing — mentioned in a consolidation request but not yet scoped
  anywhere in this repo's history; needs a real spec before starting
- Newsletter integration (Phase 2) — static "coming soon" UI only right now

## TODO / Follow-ups

- CSV export per world unit (future phase, not scoped yet)
- Fight Club 5e XML compendium export per world unit (future phase) — the
  `keyFigure.statBlock` field names already mirror the XML element names
  1:1 for this; see "Wiki unit architecture" (`docs/wiki-architecture.md`)
- Part B (share buttons) from Phase 1.4 — explicitly deprioritized/skipped
  this session (see Release History v0.1.3); build `ShareButtons` and add
  to events/articles/wiki-lore detail pages when there's time
- Fix the `opengraph-image.tsx` precedence caveat noted in "SEO & Discord
  funnel" (`docs/seo-and-infra.md`), if the per-event *generated* fallback
  image (vs. the generic site fallback) turns out to matter in practice
- **Manual, non-code steps for the site owner** (not something Claude Code
  can do):
  - Submit `/sitemap.xml` to Google Search Console
  - Create a free Google Business Profile for "Criticals and Fumbles"
  - Test share previews at https://www.opengraph.xyz/ and Facebook's
    Sharing Debugger once this branch is live
  - Send a test link to yourself on WhatsApp to verify its preview
- (the homepage "Latest Updates" activity feed, previously tracked here as
  a TODO, shipped as the Hero panel — see HeroRightPanel in
  `docs/components.md` and Release History above)
