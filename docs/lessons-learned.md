# Lessons Learned

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — original content unchanged, only moved. One new
process note appended at the end, dated. Read this before any schema
rename/restructure, or when debugging "content not appearing" issues.

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
consequence of skipping it once already (see `docs/release-history.md`
v0.1.1): the `teamMember.tier` schema enum was renamed and deployed to
Studio (`npx sanity deploy`) in one session, but the website code that
reads `tier` (the `/team` page's section-bucketing logic) stayed on an
unmerged branch. Result: editors started saving the *new* tier values in
Studio (schema allowed it) while production still matched on the *old*
string literals — 6 of 7 team members silently stopped rendering anywhere.
Nothing in Sanity enforces enum values at the data layer; `options.list` is
a Studio-form-only constraint, so GROQ happily returns documents with
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

## Process note — Schema Safety Protocol formalized (2026-08-15)

The root `CLAUDE.md`'s Schema Safety Protocol (verify-before-touching,
additive-by-default, stop-and-ask-on-ambiguity, migrate-don't-assume,
verify-after) existed only as repeated prompt instructions across several
sessions until 2026-08-15 — formalised into `CLAUDE.md` during the
modularization session so it persists without needing to be re-stated
every time. Item 4 of that protocol (the enum-rename migration steps) is
the same content as the "Enum rename rule" lesson above, embedded verbatim
in root since it's the one piece of this protocol that was already written
down prior to this session.

## Two-tier risk tracking

This file is the permanent record of CLOSED incidents and the rules they
produced. For CURRENTLY OPEN, unresolved risks, check GitHub Issues
labelled `known-risk` — run `gh issue list --label known-risk --state
open`. When an issue is resolved, its lesson should be added here as a new
entry and the issue closed.

## Process note — workflow & ownership (known-risk issues)

Claude Code maintains known-risk issue hygiene autonomously — creating
issues when new risks are found, closing them with a clear summary comment
when resolved, and always adding a permanent lessons-learned entry before
closing. The user reviews periodically via `gh issue list --label
known-risk` rather than approving each action. Closing comments must be
self-contained and clear, since they are the audit trail the user will
actually read.
