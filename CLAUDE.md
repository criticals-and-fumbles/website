@AGENTS.md

# Criticals and Fumbles (cnf.sg) — Project Memory

Phase 1 scaffold: static-content-driven pages backed by Sanity CMS, deployed to
Cloudflare Pages via `@opennextjs/cloudflare`. No newsletter/email/payment
integrations yet — those are a later phase.

## Stack

- **Framework:** Next.js 16.3 (App Router, TypeScript, no `src/` directory)
- **Styling:** Tailwind CSS v4 (CSS-variable theme in `app/(site)/globals.css`) — no component libraries
- **CMS:** Sanity v6, embedded Studio at `/studio`
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

**Pinned versions — do not casually bump:**
- `wrangler` is pinned to `4.86.0` (devDependency) and `compatibility_date` in
  `wrangler.toml` is `2026-05-03`. Every wrangler version from `4.87.0` on
  requires **Node ≥22**, which conflicts with this project's Node 20 LTS. If
  you ever move this project to Node 22+, you can bump both `wrangler` and
  `compatibility_date` together — just don't bump one without the other, or
  local preview breaks with a "compatibility date not supported" error.

**R2 bucket required for ISR caching to actually persist:** `wrangler.toml`
declares an `[[r2_buckets]]` binding (`NEXT_INC_CACHE_R2_BUCKET`,
`bucket_name = "cnf-website-cache"`) for `open-next.config.ts`'s
`r2IncrementalCache`. Locally, `wrangler dev`/`preview` emulate this
automatically — no real bucket needed. **For production**, create the real
bucket first: `wrangler r2 bucket create cnf-website-cache` — without it,
ISR revalidation silently no-ops (pages still render, just never cache;
`R2IncrementalCache` throws an `IgnorableError` that OpenNext catches).

**No D1 database.** The original scaffold spec included a D1 binding with a
placeholder ID; it was omitted since nothing in the app uses D1 (the cache
is R2-backed) and a placeholder ID would have blocked `wrangler deploy`. Add
one later if a real use case needs it.

## Route structure — why there are two "root" segments

Sanity Studio needs a full-screen layout with no site Nav/Footer. Next.js only
allows one `<html>/<body>` per root layout, so this project uses **multiple
root layouts** via route groups:

- `app/(site)/` — the marketing/content site. Has its own `layout.tsx`
  (fonts, theme script, `<Nav>`, `<ToastHost>`). All pages live here.
- `app/studio/[[...tool]]/` — the embedded Sanity Studio. Has its own minimal
  `layout.tsx` (re-exports `metadata`/`viewport` from `next-sanity/studio`).

**`(site)` is a folder name, not a URL segment** — `app/(site)/about/page.tsx`
serves `/about`, not `/(site)/about`. When adding a new site page, put it
under `app/(site)/`.

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

### Enum values that were inferred, not specified

The original spec left these field option lists undefined. Reasonable
defaults were chosen — **confirm with the team and edit the schema file
directly if they want different values** (all are plain `options.list`
arrays, easy to change):

- `teamMember.role` — left as **free text**, not an enum (no guild-title list existed to work from)
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
