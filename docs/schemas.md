# Sanity Schema Reference

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved (internal
"see below"/"above" references updated to point at the correct file).
Read this when creating or modifying any Sanity schema. See root
`CLAUDE.md` for the mandatory Schema Safety Protocol before making any
change described or implied here.

## Sanity schema summary

All schemas live in `sanity/schemas/`, registered in `sanity/schemas/index.ts`.
Four singletons (`siteSettings`, `philosophy`, `codeOfConduct`, `aiCharter`)
pinned in the Studio structure (`sanity.config.ts`'s `SINGLETON_TYPES` set +
a fixed-ID list item each) so editors can't create duplicates — this is the
only singleton mechanism used in this project; **none of the four schemas
themselves set `__experimental_actions`** (a request for `aiCharter`
initially proposed this again — same deviation CLAUDE.md's release history
already caught once for `codeOfConduct` — caught before writing the schema
and built to match the real pattern instead, see
`docs/release-history.md` v0.1.14). Sixteen non-singleton document types:
`world`, `worldUnit`, `division`, `teamMember`, `article`, `regularEvent`,
`majorEvent`, `loreEntry`, `sessionLog`, `keyFigure`, `notablePlace`,
`magicItem`, `faction`, `organisation`, `resource`, `galleryPhoto`. One
reusable object: `calloutBlock` (used inside `article.body`,
`loreEntry.body`, `sessionLog.fullRecap`).

**To add a new schema:** create the file in `sanity/schemas/`, import and add
it to the `types` array in `sanity/schemas/index.ts`. If it needs GROQ
queries, add them to `sanity/lib/queries.ts` and the TS shape to
`sanity/lib/types.ts`.

**`galleryPhoto` stores a real Sanity `image` asset** (field name `image`,
type `"image"`, with hotspot + an `alt` subfield) — not a string URL, and
not R2-backed. `GALLERY_PHOTOS_QUERY` selects `image` directly; `GalleryPhoto`
in `sanity/lib/types.ts` types it as `SanityImage`. The only R2 bucket in
this project is `cnf-website-cache` (ISR incremental cache, see
`docs/seo-and-infra.md`) — there is no separate media/gallery R2 bucket.

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
  Architect, plus 8 more added 2026-08-14: Narrator, Storyteller, Loremaster,
  Apprentice, Curator, Maestro, Crafter, Smith — see `TEAM_MEMBER_ROLES` in
  `sanity/schemas/constants.ts`, single source of truth for both the Studio
  options list and `CharacterCard.tsx`'s display labels). Any GROQ query or
  component that still references singular `role` on a `teamMember`
  document is stale — use `roles` (array) instead.
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
