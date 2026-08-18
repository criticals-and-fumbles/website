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
- Site (production, canonical since 2026-08-14): https://www.criticalsandfumbles.com
  (apex `criticalsandfumbles.com` and the original
  `https://cnf-sg.criticalsandfumbles.workers.dev` both still resolve to the
  same Worker — no redirect enforced between any of the three, canonical
  choice is app-level via `NEXT_PUBLIC_SITE_URL` only)
- Studio: https://cnf-website.sanity.studio

**Before starting work, check the index below and read ONLY the module(s)
relevant to this task — not all of them.** If uncertain whether a module is
relevant, err on the side of reading it; the cost of missing context is
higher than the cost of one extra file read. The Schema Safety Protocol and
Bundle Budget below apply to every session regardless of task and are not
optional reading.

## Schema Safety Protocol

Applies to any session that creates, modifies, or touches a Sanity schema —
especially existing schemas with live production data (`teamMember`,
`siteSettings`, `world`, event types). This protocol exists because of the
tier/role rename incident (full account in `docs/lessons-learned.md`) where
6 of 7 team members became invisible after an enum rename shipped without a
migration step.

1. **Verify before touching.** Before editing any existing schema, run the
   relevant query in Sanity Vision and show the actual current data — e.g.
   `*[_type == "teamMember"]{ handle, tier, roles }`. Never assume the
   current schema/data state from memory or from what a prompt describes —
   confirm it live first.
2. **Additive by default.** New fields, new schema types, and new enum
   options are always safe and require no special caution. Renaming,
   restructuring, or removing an EXISTING field or enum value is never
   additive — treat it as high-risk regardless of how small it looks.
3. **Stop and ask on ambiguity.** If a requested change could plausibly
   require touching an existing field's name, type, or meaning — stop and
   ask the user before proceeding, rather than making a judgement call
   alone. This applies even if the change seems small or the user's
   request seems to imply it.
4. **Migrate, don't assume (enum renames specifically).** This project hit
   the consequence of skipping this once already: the `teamMember.tier`
   schema enum was renamed and deployed to Studio (`npx sanity deploy`) in
   one session, but the website code that reads `tier` (the `/team` page's
   section-bucketing logic) stayed on an unmerged branch. Result: editors
   started saving the *new* tier values in Studio (schema allowed it) while
   production still matched on the *old* string literals — 6 of 7 team
   members silently stopped rendering anywhere. Nothing in Sanity enforces
   enum values at the data layer; `options.list` is a Studio-form-only
   constraint, so GROQ happily returns documents with values that predate
   — or postdate — whatever the current schema says. Correct order of
   operations for a live enum rename:
   1. Deploy the schema and website code **together** (same merge, same
      deploy) — never let Studio's allowed values and the website's
      string-literal comparisons drift apart, even briefly.
   2. If old documents might already hold the previous values, write a
      dry-run migration script before deploying, not after something
      breaks.
   3. Only widen `options.list` to accept old+new values as a *transition*
      aid if the deploy can't be atomic — remove the old values once data
      is confirmed clean.
5. **Verify after, not just before.** After any schema change, run the
   same live query again and confirm existing data is intact before
   considering the change complete. Show this confirmation, don't just
   assume the change worked as intended.
6. **This protocol is not optional reading.** This section lives in the
   root `CLAUDE.md` specifically so it loads on every session regardless
   of which module(s) are read — because schema risk can appear in
   sessions that don't look schema-related at first glance (e.g. "add new
   role options" still touches the same field that caused the original
   incident).

## Risk check & ownership

Before starting any session that touches an existing schema, run `gh issue
list --label known-risk --state open` and review results relevant to the
schema/area you're about to touch. Claude Code owns known-risk issue
hygiene autonomously — create issues for new risks found (don't just
mention them and move on), close issues you resolve (with a clear summary
comment and a corresponding `docs/lessons-learned.md` entry, added before
closing), and leave issues open with a progress comment if only partially
resolved. The user reviews periodically, not per-action — write closing
comments that stand alone as a clear audit trail.

## Bundle size budget

**Current verified baseline: ~1.36 MB gzip / 3 MiB free-tier limit (45%
used, ~1.7 MB headroom).** Before adding any new dependency, check impact
with `npm run build:cloudflare` then `npx wrangler versions upload
--preview-alias <name>` to get the real gzip figure — BEFORE and AFTER.
Full history of how this number moved (the 2.08 MB OG-image spike and its
fix) is in `docs/seo-and-infra.md`.

## Stack

Next.js 16.3 (App Router) + Sanity v6 (Studio hosted separately at
`cnf-website.sanity.studio` — **never embed `/studio` in the app**, it
bloats the Worker bundle past Cloudflare's limit) + Cloudflare Worker via
`@opennextjs/cloudflare` + Tailwind CSS v4. Full detail: `docs/seo-and-infra.md`.

## Module index

| Module | Read this when... |
|---|---|
| `docs/schemas.md` | Creating or modifying any Sanity schema, adding enum options, checking what document types exist |
| `docs/wiki-architecture.md` | Working on `worldUnit`, `keyFigure`, stat blocks, wiki pages/routes, or the four worlds |
| `docs/components.md` | Building or editing React components, page routing conventions, the Hero panel, or adding a new page |
| `docs/design-system.md` | Working on colours, typography, CSS tokens, dark/light mode, or brand voice/values content |
| `docs/seo-and-infra.md` | Working on metadata, OG images, domain/env config, R2 usage, Cloudflare deployment, or bundle-size history |
| `docs/migrations.md` | Writing or running a Sanity migration or seed script |
| `docs/lessons-learned.md` | Before any schema rename/restructure, or when debugging "content not appearing" issues |
| `docs/release-history.md` | Reference only — rarely needed. Also holds open TODOs/follow-ups |
