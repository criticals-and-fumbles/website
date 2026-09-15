import Image from "next/image";
import Link from "next/link";
import type { ArticleCard as ArticleCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const imageUrl = urlForImage(article.coverImage)
    ?.width(600)
    .height(340)
    .fit("max")
    .ignoreImageParams()
    .auto("format")
    .url();

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface/75 transition-colors hover:border-emerald"
    >
      {/* object-contain, not cover — a cover image can be any aspect
          ratio an editor uploaded, and this box is a fixed 16/9. cover
          was cropping a meaningful chunk off anything that didn't
          already match that ratio; contain scales the whole image down
          to fit instead, letterboxed against bg-bg-forest rather than
          cropped (same fix as campaigns' directory card-image).
          Also needs two chained calls on the urlForImage() builder above,
          not just fit("max"):
          - @sanity/image-url auto-computes a centered crop rect matching
            the requested width/height aspect ratio whenever BOTH are set
            — this happens regardless of fit mode, so fit("max") alone
            still scales-to-fit an already-cropped rect, not the original
            image (confirmed by reading the builder's own source: see the
            internal `fit()` helper in @sanity/image-url, which only skips
            this when spec.ignoreImageParams is set).
          - .ignoreImageParams() is what actually disables that
            auto-crop, so the full original image is sent to the CDN;
            fit("max") then scale-to-fits THAT within the box instead of
            stretching/cropping it, which is what finally lets
            object-contain letterbox the whole image correctly. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={article.coverImage?.alt ?? article.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {article.category && <Badge variant="emerald">{article.category}</Badge>}
          {article.recommendedFor?.map((tag) => (
            <Badge key={tag} variant="surface">
              {tag}
            </Badge>
          ))}
        </div>
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
