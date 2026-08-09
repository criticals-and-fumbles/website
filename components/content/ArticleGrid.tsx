import type { ArticleCard as ArticleCardData } from "@/sanity/lib/types";
import { ArticleCard } from "./ArticleCard";

export function ArticleGrid({ articles }: { articles: ArticleCardData[] }) {
  if (!articles.length) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        No articles here yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  );
}
