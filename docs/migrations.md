# Migrations & Seeding

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved. Read this when
writing or running a Sanity migration or seed script.

## Migration scripts

`sanity/migrations/` — one-off data-patch scripts, run manually via
`npx tsx sanity/migrations/<name>.ts`. Not a generic runner/framework —
each script is purpose-built for its one patch, following a dry-run-first
pattern: defaults to logging proposed changes only, real writes require
`DRY_RUN=false`. Requires `SANITY_API_WRITE_TOKEN` in `.env.local` (see
Environment variables in `docs/seo-and-infra.md`). Always read the
dry-run output before re-running with `DRY_RUN=false`.

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
