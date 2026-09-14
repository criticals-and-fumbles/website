# Design System & Brand Philosophy

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved. Read this when
working on colours, typography, CSS tokens, dark/light mode, or brand
voice/values content. (Note: "C&F design philosophy" below was folded in
from its own top-level section in the original file — it's brand-values
reference content, not visual design tokens, but there was no better-fitting
module for it.)

## Design system

**2026-09-15: recoloured/refonted sitewide to the "celestial" design
system** (first built as the `/celestial` preview route, approved
there, then rolled out as the actual default — see `docs/components.md`
for the rollout notes and what's excluded). This section describes the
CURRENT sitewide default, not history — the tables below replace what
used to be here rather than appending to it.

Fonts (Google Fonts, loaded in `app/(site)/layout.tsx` via
`next/font/google` — same as before, still no runtime request to
fonts.googleapis.com despite the CSP, since `next/font/google` bakes
the font files into the build output):

| Role | Font | Tailwind class |
|---|---|---|
| Display / headings | EB Garamond | `font-display` |
| Body / prose | Plus Jakarta Sans | default body font |
| UI / labels / tags / nav / buttons | Cinzel | `font-ui` |

The underlying CSS variable names (`--font-bebas-neue`, `--font-crimson-pro`,
`--font-space-mono`) are unchanged from before this switch — only which
actual font loads into each, and which role it fills, changed (Cinzel
now fills the UI-label role `--font-space-mono` used to, not the
display-heading role its old name might suggest). Renaming them was a
pure-cost, no-benefit churn across every file that references
`font-display`/`font-ui` (93 files at last count), so they were left
alone.

**Base font size is 18px (set on the `html` element) — optimised for a 4K
display.** Body text uses 1.125rem minimum. All font sizes use
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
| `bg` | `#020509` | `#F7F2E6` |
| `bg-forest` | `#03080C` | `#03080C` (always dark, both themes — unchanged) |
| `surface` | `#0D141D` | `#FDF9F0` |
| `border` | `#2A2A2A` | `#D8C69A` |
| `text` | `#E5E7EB` | `#2B2416` |
| `text-muted` | `#9CA3AF` | `#6B6152` |
| `emerald` | `#D4AF37` (gold) | `#92721F` |
| `amber` | `#EAB308` (brighter gold) | `#A67C00` |
| `magenta` | `#F9A8D4` | `#BE185D` |

`--emerald`/`--amber`/`--magenta` are kept as the token NAMES (every
component already reads colour through these three — renaming them
would mean re-touching ~67 files for no functional reason) but now hold
celestial's actual hues rather than the old green/bronze/pink. `emerald`
is gold, celestial's primary accent, filling the same "the one colour
most links/hovers/borders use" role it always filled; `amber` is a
second, slightly brighter gold kept distinct for treatments that want
to stand out from the plain accent; `magenta` is celestial's real
magenta/pink, used the same sparingly-in-a-few-spots way it always was.

Theme switching: `ThemeProvider` (`components/layout/ThemeProvider.tsx`)
toggles a `dark`/`light` class on `<html>`, persisted to `localStorage` under
`cnf-theme` (and a `.criticalsandfumbles.com`-scoped cookie, shared with
the campaigns repo's own directory page — see that repo's `CLAUDE.md`).
An inline script (`THEME_INIT_SCRIPT`, injected in `app/(site)/layout.tsx`
`<head>`) applies the class **before** hydration to avoid a flash of the
wrong theme. This mechanism needed no changes for the recolour — it
already repaints every token-driven utility live, confirmed directly
before rolling this out (the live-toggle staleness bug found while
building `/celestial` turned out to be specific to one narrow pattern,
Tailwind arbitrary-bracket syntax referencing a custom property
directly, e.g. `bg-[var(--x)]` — not to the named-token `@theme inline`
indirection this sitewide system uses throughout).

**Brand title treatment — RETIRED as of the 2026-09-15 recolour.** The
three-word/three-colour split (Criticals=emerald, &=amber,
Fumbles=magenta) is no longer used; both of its previous call sites
(`components/home/Hero.tsx`, `app/(site)/not-found.tsx`) now render the
full "Criticals & Fumbles" as a single `text-emerald` (gold) heading,
matching `/celestial`'s own nav wordmark treatment. This was an
explicit decision, not an oversight — don't reintroduce the three-span
pattern without checking first.

## `.celestial` theme scope (added 2026-09-12, `/celestial` preview route only)

**Note (2026-09-15):** this scope's palette is what the sitewide
`.dark`/`.light` tokens above were recoloured to match — `/celestial`
was the staging preview for that rollout, approved, then applied
sitewide. `/celestial` itself still exists as its own route with this
separate `.celestial` scope (slightly different token set — e.g. its
own `--celestial-gold-*` scale and pre-mixed opacity tokens, needed
there for a client-side theme toggle `/celestial` has that the
sitewide pages don't replicate) — it just isn't the only place with
this look anymore. Whether `/celestial` stays a separate preview or
gets folded into the real homepage is a separate decision, not made
as part of this rollout.

A third scope alongside `.dark`/`.light` in `app/(site)/globals.css`,
applied only within the `/celestial` preview route (see
`docs/components.md`). Ported from an approved static mockup
(`code.html`) — a different, more ornate "TTRPGs with a Twist"
celestial/astrolabe direction than the earlier (now-scrapped) `/lobby`
preview. None of these values overlap with the site's PREVIOUS
`--emerald`/`--amber`/`--magenta` closely enough to have reused them at
the time — the mockup's gold and rose-magenta were genuinely different
hues from what dark/light held before 2026-09-15.

| Token | Value |
|---|---|
| `--celestial-deep` | `#03080c` |
| `--celestial-surface` | `#0d141d` |
| `--celestial-card` | `#151c26` |
| `--celestial-teal` | `#00e5c8` |
| `--celestial-cyan` | `#38bdf8` |
| `--celestial-magenta` | `#f43f5e` |
| `--celestial-purple` | `#c084fc` |

Also adds a real Tailwind colour **scale** (not just a single custom
property) via the `@theme inline` block, matching the mockup's own gold
palette exactly so `bg-gold-500/20`/`text-gold-300`/etc. work as plain
Tailwind utilities:

| Utility prefix | Value |
|---|---|
| `gold-300` | `#fde047` |
| `gold-400` | `#eab308` |
| `gold-500` | `#d4af37` |
| `gold-600` | `#b89324` |
| `gold-700` | `#8c6d17` |
| `gold-900` | `#3e2e05` |

This is additive sitewide (confirmed nothing outside `/celestial`
references `gold-*` before adding it) — unlike the token table above,
which stays scoped to the `.celestial` class itself.

Fonts (self-hosted under `public/fonts/`, loaded via `next/font/local`
in `app/celestial/layout.tsx`, distinct from the site's normal Bebas
Neue/Crimson Pro/Space Mono): Cinzel, EB Garamond (incl. a separate
italic file), Plus Jakarta Sans, Space Grotesk — all genuine variable
fonts (Google served one identical file across every requested weight
per family), so one file per family/style covers the full range these
pages use. `font-serif`/`font-sans`/`font-mono` (Tailwind's own
defaults) are overridden to point at these for this route only — the
underlying CSS variables are only ever defined on `/celestial`'s own
`<html>`, so elsewhere they're simply unset and those utilities fall
back to inherited font-family, same as if this override didn't exist
(confirmed no other file in this codebase uses `font-serif`/`font-sans`/
`font-mono` before doing this).

## C&F design philosophy (for reference / prompting)

**Tagline:** "Good Players Make Good Tables. Good Tables Make Good Stories."

**Tier I — Values** (emerald): Community, Collaboration, Sincerity
**Tier II — Feelings** (amber): Your Seat, Your Party, Your Campaign
**Tier III — Outcomes** (magenta): A Guild That Runs Itself, Worlds Worth
Returning To, Friends Who Know Your Alignment

Full wording lives in the `philosophy` Sanity singleton — editable via
Studio, not hardcoded in components (except the `PhilosophyStrip` fallback
tagline).
