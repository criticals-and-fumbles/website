# Components & Page Conventions

Relocated verbatim from the root `CLAUDE.md` during the 2026-08-15
modularization session — no content changed, only moved (internal
"see below"/"above" references updated to point at the correct file).
Read this when building or editing React components, page routing
conventions, the Hero panel, or adding a new page.

## Route structure — the `(site)` route group

All pages live under `app/(site)/` — **`(site)` is a folder name, not a URL
segment**, so `app/(site)/about/page.tsx` serves `/about`, not `/(site)/about`.
When adding a new page, put it under `app/(site)/`.

This route group exists for a reason that no longer applies but isn't worth
undoing: Sanity Studio originally lived at `app/studio/[[...tool]]/` with its
own root layout (Next.js requires one `<html>/<body>` per root layout, and
Studio needed a full-screen one with no site Nav/Footer), which meant the
site itself also needed to be a named route group rather than living directly
in `app/`. Studio has since been removed from this app entirely (see
`docs/seo-and-infra.md`) — so today there's only one root layout and the
group isn't strictly necessary — but flattening `app/(site)/*` back to
`app/*` is a pure-organization change with no functional upside, so it's
been left as-is.

### Footer is per-page, not global

`components/layout/Footer.tsx` takes an optional `pageFooterCTA` prop
(Portable Text). Because each content type's `pageFooterCTA` field is
page-specific, `<Footer />` is **not** rendered in the root layout — every
`page.tsx` renders its own `<Footer pageFooterCTA={...} />` as the last
element in its JSX. Copy that pattern for new pages; forgetting it means no
footer on that route.

### Pages not in the original site map

`/articles` and `/articles/[slug]` weren't in the spec's page list, but the
homepage ("All Articles →"), article cards, and author bylines all link to
them — added as the obvious missing piece.

## HeroRightPanel

`components/home/HeroRightPanel.tsx` — renders the homepage Hero's right
half. Two independent sections:

- **Pinned event banner** — renders only if `pinnedEvent` is non-null.
  Sourced from `HOME_PINNED_EVENT_QUERY`: any `majorEvent` with status
  `registration-open`/`coming-soon`/`watch-this-space`, preferring
  registration-open, then coming-soon, then most-recently-updated. GROQ
  note: ordering by a boolean comparison needs parens —
  `(status == "x") desc`, not `status == "x" desc` (the latter is a GROQ
  parse error, "unexpected postfix operator desc").
- **"Latest Updates" feed** — a flat, pre-merged, pre-sorted
  `RssFeedItem[]` (merging + sorting happens in `app/(site)/page.tsx`, not
  inside the component) spanning `article`, `majorEvent`, `regularEvent`,
  `loreEntry`, `sessionLog`, `teamMember`, `worldUnit`, `keyFigure`,
  `notablePlace`, `magicItem`, `faction`, newest `date` first, capped at 5.
  Items past index 2 are hidden below the `md` breakpoint (3 items on
  mobile, 5 from tablet up) via a per-item `hidden md:flex` class, not a
  separate query/prop.

  **Bug fixed 2026-08-12:** the 5 Phase 1.3 wiki types (`worldUnit` +
  the 4 unit-scoped entry types) were never added to `HOME_RSS_FEED_QUERY`
  when Phase 1.3 shipped — that query predates them, from the earlier
  Phase 1.1 session. Editing/creating a `worldUnit` (or any entry type)
  silently never appeared in "Latest Updates". Fixed by adding a subquery
  + `typeConfig`/`itemHref` case for each. If a 6th wiki content type is
  ever added, remember to wire it into **all** of: the `HOME_RSS_FEED_QUERY`
  subquery, `RssFeedItem`'s `_type` union and `RssFeedData` in
  `sanity/lib/types.ts`, the merge array in `app/(site)/page.tsx`, and
  `typeConfig`/`itemHref` in `HeroRightPanel.tsx` — missing any one of
  these fails silently (item just doesn't show, or throws if `typeConfig`
  lookup is missing since `RssItem` doesn't guard against an unknown
  `_type`).

  `worldUnit` items show the world's actual `unitLabel` (fetched per-item
  as `"unitLabel": world->unitLabel`) as their badge text, not a hardcoded
  "Territory" — labels are per-world and editor-renamable (see
  `docs/wiki-architecture.md`), so a static label would be wrong for any
  world that doesn't use "Territory".

  **`article`'s date field, fixed 2026-08-12:** every other type in this
  feed orders/dates by `_updatedAt` (any edit resurfaces it), but the
  `articles` subquery used `coalesce(publishedAt, _updatedAt)` — since
  `publishedAt` is set once and normally never changes, editing an
  already-published article's title/body afterward did **not** move it in
  "Latest Updates" or update its shown date, even though `_updatedAt` had
  genuinely changed. Changed to plain `_updatedAt` so any edit resurfaces
  the article, matching every other type in this feed. **Deliberately not
  applied to `ARTICLES_QUERY`/`HOME_LATEST_ARTICLES_QUERY`** (the
  `/articles` listing page and homepage article strip) — those should stay
  ordered by publish date, not edit date, so fixing a typo on an old
  article doesn't reshuffle it to the top of the reading list. Only this
  feed's "recent activity" framing wants edit-date ordering. `sessionLog`
  has the identical `coalesce(sessionDate, _updatedAt)` pattern and the
  same latent issue — not fixed, wasn't asked for, flagged here for when
  it comes up.

Sourced from `HOME_PINNED_EVENT_QUERY` and `HOME_RSS_FEED_QUERY` in
`sanity/lib/queries.ts`; typed as `PinnedEvent` / `RssFeedItem` /
`RssFeedData` in `sanity/lib/types.ts`.

Unlike every other `bg-forest` panel on the site (which is deliberately
dark in both themes, paired with fixed `--on-forest`/`--on-forest-muted`
tokens), this panel **does** flip with the theme — dark green in dark mode,
`--surface` (light cream) in light mode — via the `.hero-right-panel` CSS
class in `globals.css`, paired with the normal theme-flipping
`text-text`/`text-text-muted` tokens. Don't reuse the on-forest tokens here.

The "live" pulsing dot next to the "Latest Updates" heading is the
`.live-dot` class + `@keyframes pulse-dot` in `globals.css`.

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
