# Wiki Architecture

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved (internal
"see below"/"above" references updated to point at the correct file).
Read this when working on `worldUnit`, `keyFigure`, stat blocks, wiki
pages/routes, or the four worlds.

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
Hero/PhilosophyStrip panels (see `docs/design-system.md`), since the card's
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
