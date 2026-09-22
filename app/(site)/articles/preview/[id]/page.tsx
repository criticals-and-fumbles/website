import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { ARTICLE_PREVIEW_QUERY } from "@/sanity/lib/queries";
import type { Article } from "@/sanity/lib/types";
import { Footer } from "@/components/layout/Footer";
import { ArticleContent } from "@/components/articles/ArticleContent";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.criticalsandfumbles.com").replace(/\/$/, "");

// Always fresh — a DM previewing a draft right after saving should never
// see stale ISR output. Traffic here is a handful of manual page loads,
// never worth caching.
export const revalidate = 0;

// Never indexed — this is a direct-link-only preview (see this file's
// main comment), not a page meant to be discoverable or ranked.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Draft article preview — a DM/writer gets a direct link
 * (/articles/preview/<article _id>) straight after saving in the
 * console, before a Studio admin has flipped status to "published" (see
 * apps/console/src/routes/api-me-articles.js). Renders through the
 * EXACT SAME <ArticleContent> component the real /articles/[slug] route
 * uses — this is the actual guarantee that "the site renders exactly as
 * the preview": there is only one render path, just two different
 * queries feeding it (ARTICLE_PREVIEW_QUERY here has no status filter
 * and is keyed by _id, vs. ARTICLE_BY_SLUG_QUERY's published-only/
 * slug-keyed lookup).
 *
 * Access model: the article's Sanity _id is the "secret" — a random,
 * non-sequential, non-guessable string (not the slug, which may not
 * even be finalized yet for a fresh draft). No separate auth/token
 * layer on top; consistent with how lightweight the rest of this
 * project's draft/publish flow already is (a Studio admin manually
 * flips status, nothing else gates a draft today either). robots.txt/
 * noindex above keeps it out of search results even if a link leaks.
 */
export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await client.fetch<Article | null>(ARTICLE_PREVIEW_QUERY, { id });

  if (!article) notFound();

  return (
    <>
      <div className="sticky top-0 z-50 bg-amber px-4 py-2 text-center font-ui text-xs font-bold uppercase tracking-wide text-black">
        Preview — {article.status === "published" ? "already live" : "draft, not published"} — not indexed, only visible via this link
      </div>
      <ArticleContent article={article} shareUrl={`${SITE_URL}/articles/preview/${id}`} />
      <Footer pageFooterCTA={article.pageFooterCTA} />
    </>
  );
}
