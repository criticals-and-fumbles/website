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

**Env vars with a trailing slash silently double up on any path
concatenation — and ISR cache means a fix doesn't appear to work
immediately even when it's deployed correctly (closed known-risk #1,
2026-08-18).** The Cloudflare Workers Builds dashboard's
`NEXT_PUBLIC_SITE_URL` had a trailing slash (`.../criticalsandfumbles.com/`)
while every usage site did `${SITE_URL}/path` assuming none — producing
`https://www.criticalsandfumbles.com//sitemap.xml` and similar in
`robots.txt`, `sitemap.xml`, and the Organization structured data's
`logo` field. Fixed by defensively stripping a trailing slash
(`.replace(/\/$/, "")`) at each of the 4 usage sites
(`lib/metadata.ts`, `app/sitemap.ts`, `app/robots.ts`,
`OrganizationStructuredData.tsx`) rather than trusting the dashboard
value to be exactly right — also replaced the stale `"https://cnf.sg"`
fallback default, which isn't even a registered domain. **Verification
gotcha hit while confirming the fix:** the fix deployed successfully
(confirmed via `wrangler deployments list`), but production kept
serving the old double-slash output for several minutes afterward —
`x-nextjs-cache: HIT` response headers revealed the R2-backed ISR cache
(`revalidate = 300`) was still serving pre-fix HTML, unrelated to which
Worker version was live. A new deploy does not invalidate previously
cached page output in R2; only checked again once the cache's own
`s-maxage` window had naturally elapsed. Don't declare a fix "live" from
deployment status alone on this project — re-check the actual response
after allowing for the ISR window, or the "verify after" step of the
Schema Safety Protocol (and this same discipline for non-schema fixes)
will report a false positive.

The root `CLAUDE.md`'s Schema Safety Protocol (verify-before-touching,
additive-by-default, stop-and-ask-on-ambiguity, migrate-don't-assume,
verify-after) existed only as repeated prompt instructions across several
sessions until 2026-08-15 — formalised into `CLAUDE.md` during the
modularization session so it persists without needing to be re-stated
every time. Item 4 of that protocol (the enum-rename migration steps) is
the same content as the "Enum rename rule" lesson above, embedded verbatim
in root since it's the one piece of this protocol that was already written
down prior to this session.

**Sanity's CDN (`apicdn.sanity.io`) caches per query string per edge
node independently — don't rely on it for content that needs to be
immediately consistent after a write, closed 2026-08-20.**
`sanity/lib/client.ts`'s public `client` used `useCdn: true`. Real
incident: `app/(site)/layout.tsx` and `components/layout/Footer.tsx`
both call `client.fetch(SITE_SETTINGS_QUERY)` with the byte-identical
query string, in the *same build*, and got different `socialLinks`
arrays back — one had a just-added entry, the other didn't. This
wasn't page-level caching (ISR/R2) or Next's fetch memoization; it
reproduced identically across three separate from-scratch rebuilds
(`rm -rf .next .open-next` each time), which rules out any local
build-artifact cache. Confirmed by querying `api.sanity.io` directly
(always returned the current document) versus `apicdn.sanity.io`
(inconsistent, same query, same moment) — the CDN's edge nodes don't
all converge on a write at the same time, and different requests
within one build can land on different nodes with different
propagation states. **Fix:** `useCdn: false` on the public client.
`api.sanity.io` needs no token for this public-read dataset, so this
was a straight swap — the tradeoff is marginally higher per-request
latency, worth it over silently-inconsistent content on a low-traffic
site. The campaigns subsite (separate repo, same Sanity project) never
used the CDN client for exactly this reason, and was unaffected.
**If a future session reintroduces `useCdn: true` for performance,
re-verify this exact failure mode is actually gone** (e.g. Sanity may
have changed CDN propagation guarantees) before trusting it again —
don't just assume it was fixed once and stays fixed.

## `next.config.ts`'s `headers()` is not honored on this stack — use `middleware.ts` (2026-08-25)

A Screaming Frog SEO audit found zero security response headers
(Content-Security-Policy, X-Content-Type-Options, HSTS, Referrer-Policy,
X-Frame-Options) on any page. The obvious fix — a `headers()` function in
`next.config.ts` — is the documented Next.js way to do this, but **does
not work on this stack**: `@opennextjs/cloudflare` does not honor
`next.config.ts`'s `headers()` at request time the way Vercel's runtime
does. There's no error or warning when this happens — the headers are
just silently absent from every response, which is what made this easy to
miss originally. **Fix:** a root `middleware.ts` — OpenNext does translate
Next middleware into Cloudflare-compatible behavior, so setting response
headers there works correctly. If a future session needs to add or change
response headers on this site, use `middleware.ts`, not `next.config.ts`'s
`headers()` — verify the header actually appears in a real response
(`curl -I`) rather than trusting that the config was accepted, since nothing
surfaces a warning if the wrong mechanism is used again.

## Screaming Frog "missing image size attributes" is a false positive for `next/image` `fill` mode (2026-08-25)

Same SEO audit flagged 43 images (95% of crawled images) as missing
width/height HTML attributes. Investigating found the overwhelming
majority are `next/image` used with the `fill` prop (sizing comes from a
`position: relative` parent with a CSS-fixed aspect ratio, not from
width/height attributes on the `<img>` tag itself) — this is the correct,
intentional Next.js pattern for avoiding CLS with variable-source images,
and Next.js deliberately does not emit width/height attributes in this
mode. Screaming Frog (and likely other crawlers checking the raw HTML
attribute rather than computed layout) flags this as an issue when it
isn't one. **If a future SEO audit re-flags this, don't chase it across
every `fill`-mode image in the codebase** — check whether the specific
flagged image is actually `fill` mode (expected, ignore) or a raw `<img>`/
non-fill `next/image` missing real dimensions (an actual bug, fix it). The
one genuine case found this session — a raw `<img>` for a Sanity-hosted
world-unit map — was fixed by switching to `next/image` with an explicit
`.width(1200).height(675)` crop transform so the delivered image's actual
dimensions match the width/height attributes exactly, rather than guessing
an aspect ratio.

## An aggregate SEO-audit count can wildly overstate real scope — get the per-URL export before estimating fix size (2026-08-25)

Issue #8 (uppercase/spaced slugs) was opened off a Screaming Frog
"Issues Overview" summary reporting "296 URLs" with uppercase characters.
When the user later provided the full per-URL export, the real number of
affected *documents* was 4 — the other ~290 rows were `?category=...`
filter query strings (expected, already correctly canonicalized), not
slug data at all. Aggregate issue-type counts in a summary export don't
distinguish "this pattern repeats across N query-string variants of one
page" from "N different documents have a real problem" — always ask for
or generate the per-URL detail before scoping a fix, rather than
estimating effort (or triage priority) from the summary count alone.

## `next.config.ts` redirects() path matching is case-insensitive — exact-case redirects need `middleware.ts` (2026-08-25)

Fixing the 4 real uppercase-slug documents from the entry above required
redirecting the old uppercase URL to the new lowercase one. The obvious
approach — a `next.config.ts` `redirects()` rule with the old uppercase
path as `source` — silently breaks: that mechanism's path-to-regexp
matching is case-insensitive by default, so the literal-cased source ALSO
matches its own already-lowercase `destination`, and the fixed URL
redirects to itself instead of ever serving the page (caught locally
before deploy, not in production this time). This is the same underlying
failure class as the earlier apex/www unanchored-host-regex incident
(see above) — a redirect rule silently matching more than intended — just
via case-insensitivity instead of an unanchored regex. **Fix:** exact-case
path redirects belong in `middleware.ts` via plain JS string
comparison (`request.nextUrl.pathname === "/exact/Old/Path"`), not
`next.config.ts`'s `redirects()`. **Whenever a future session adds a
redirect for a specific already-cased URL, verify both directions**
— the old URL 308s to the new one, AND the new URL actually resolves
200, not another redirect — the second check is what would have caught
this before deploy.

## Don't assume `git push` = deployed — verify the deploy actually landed (2026-08-25)

A push of 3 commits produced no Cloudflare Workers Build run at all — not
a failure, just nothing, confirmed by checking the build history in the
dashboard. Investigated as a possible root-cause issue (see closed issue
#6): GitHub App access to the repo was confirmed fine, `main` is the
correct default branch, and an *earlier* push in the same session had
triggered a real, successful CI build moments before — so the mechanism
itself works. Webhook delivery logs (which would show whether GitHub
even attempted to notify Cloudflare for the missed push) aren't visible
to us — that data belongs to the GitHub App's owner (Cloudflare), not
the installing org, a GitHub Apps platform restriction, not a
misconfiguration on this repo's side. Most likely explanation (per the
user): a second build may have been manually triggered from the
Cloudflare dashboard before the first had fully committed, dropping the
subsequent webhook-triggered request. Isolated occurrence, not a
reproducible pattern — not worth a Cloudflare support ticket unless it
recurs.

**Practical takeaway, independent of root cause**: `git push` succeeding
and GitHub showing the merge does NOT confirm the site actually
redeployed — there is no error surfaced anywhere when a trigger drops.
After any push expected to go live, verify with `npx wrangler
deployments list` (check the newest entry's timestamp is actually after
the push) or a live-site check for something the change would visibly
affect, before assuming it shipped. If a deploy didn't land, the safe
manual fallback is documented above (`npm run build:cloudflare && npm
run deploy` — never skip the build step).

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
