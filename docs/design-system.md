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

## C&F design philosophy (for reference / prompting)

**Tagline:** "Good Players Make Good Tables. Good Tables Make Good Stories."

**Tier I — Values** (emerald): Community, Collaboration, Sincerity
**Tier II — Feelings** (amber): Your Seat, Your Party, Your Campaign
**Tier III — Outcomes** (magenta): A Guild That Runs Itself, Worlds Worth
Returning To, Friends Who Know Your Alignment

Full wording lives in the `philosophy` Sanity singleton — editable via
Studio, not hardcoded in components (except the `PhilosophyStrip` fallback
tagline).
