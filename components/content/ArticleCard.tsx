import Image from "next/image";
import Link from "next/link";
import type { ArticleCard as ArticleCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const imageUrl = urlForImage(article.coverImage)
    ?.width(600)
    .height(340)
    .auto("format")
    .url();

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-emerald"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={article.coverImage?.alt ?? article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {article.category && <Badge variant="emerald">{article.category}</Badge>}
        <h3 className="font-display text-2xl leading-tight text-text">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="card-description line-clamp-3 flex-1 text-text-muted">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between font-ui text-xs text-text-muted">
          <span>{article.author?.handle}</span>
          {article.readTimeMinutes && <span>{article.readTimeMinutes} min read</span>}
        </div>
      </div>
    </Link>
  );
}
