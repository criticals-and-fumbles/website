# Design System & Brand Philosophy

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved. Read this when
working on colours, typography, CSS tokens, dark/light mode, or brand
voice/values content. (Note: "C&F design philosophy" below was folded in
from its own top-level section in the original file — it's brand-values
reference content, not visual design tokens, but there was no better-fitting
module for it.)

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

## `.celestial` theme scope (added 2026-09-12, `/celestial` preview route only)

A third scope alongside `.dark`/`.light` in `app/(site)/globals.css`,
applied only within the `/celestial` preview route (see
`docs/components.md`). Ported from an approved static mockup
(`code.html`) — a different, more ornate "TTRPGs with a Twist"
celestial/astrolabe direction than the earlier (now-scrapped) `/lobby`
preview. None of these values overlap with the site's existing
`--emerald`/`--amber`/`--magenta` closely enough to reuse — the
mockup's gold and rose-magenta are genuinely different hues.

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
