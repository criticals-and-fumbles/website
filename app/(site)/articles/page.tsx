import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";
import { ARTICLE_CATEGORIES } from "@/sanity/schemas/constants";
import type { ArticleCard } from "@/sanity/lib/types";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function ArticlesPage({
  searchParams,
}: PageProps<"/articles">) {
  const { category } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;

  const articles = await client.fetch<ArticleCard[]>(ARTICLES_QUERY, {
    category: activeCategory ?? null,
  });

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-text">Articles</h1>
      <p className="mt-2 max-w-prose text-text-muted">
        Campaign craft, DM advice, reviews, and everything in between.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full border px-4 py-2 font-ui text-xs transition-colors ${
            !activeCategory
              ? "border-emerald text-emerald"
              : "border-border text-text-muted hover:border-emerald hover:text-emerald"
          }`}
        >
          All
        </Link>
        {ARTICLE_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/articles?category=${encodeURIComponent(cat)}`}
            className={`rounded-full border px-4 py-2 font-ui text-xs transition-colors ${
              activeCategory === cat
                ? "border-emerald text-emerald"
                : "border-border text-text-muted hover:border-emerald hover:text-emerald"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <ArticleGrid articles={articles} />
      </div>
    </div>

    <Footer />
    </>
  );
}
