import type { ArticleCard as ArticleCardData } from "@/sanity/lib/types";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { LinkButton } from "@/components/ui/Button";

export function ArticleStrip({ articles }: { articles: ArticleCardData[] }) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-4xl text-text">Latest Rolls</h2>
          <LinkButton href="/articles" variant="ghost">
            All Articles →
          </LinkButton>
        </div>
        <ArticleGrid articles={articles} />
      </div>
    </section>
  );
}
