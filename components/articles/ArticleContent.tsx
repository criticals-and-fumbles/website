import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import type { Article } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Renderer } from "@/components/portable-text/Renderer";
import { ArticleStructuredData } from "@/components/seo/ArticleStructuredData";
import { ShareButtons } from "@/components/ui/ShareButtons";

/**
 * The actual article render — extracted from app/(site)/articles/[slug]/
 * page.tsx so the preview route (app/(site)/articles/preview/[id]/
 * page.tsx) renders through this exact same component, not a
 * hand-copied approximation. This is the whole point of the preview
 * feature: there's no second render path to drift out of sync with the
 * live one — only two different queries (published-only vs. by id)
 * feeding the same JSX.
 */
export function ArticleContent({ article, shareUrl }: { article: Article; shareUrl: string }) {
  const coverUrl = urlForImage(article.coverImage)
    ?.width(1400)
    .height(700)
    .auto("format")
    .url();

  return (
    <>
      <ArticleStructuredData
        article={{
          title: article.title,
          excerpt: article.metaDescription ?? article.excerpt,
          publishedAt: article.publishedAt,
          author: article.author,
          image: coverUrl,
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        {article.category && <Badge variant="emerald">{article.category}</Badge>}
        <h1 className="mt-4 font-display text-4xl leading-tight text-text md:text-5xl">
          {article.title}
        </h1>
        <h2 className="sr-only">Chronicle</h2>
        <div className="mt-4 flex items-center gap-3 font-ui text-xs text-text-muted">
          {article.author && (
            <Link
              href={`/team/${article.author.slug}`}
              className="hover:text-emerald"
            >
              {article.author.handle}
            </Link>
          )}
          {article.publishedAt && (
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          )}
          {article.readTimeMinutes && <span>{article.readTimeMinutes} min read</span>}
        </div>

        <div className="mt-4">
          <ShareButtons url={shareUrl} title={article.title} />
        </div>

        {coverUrl && (
          <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
            <Image
              src={coverUrl}
              alt={article.coverImage?.alt ?? article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-10">
          <Renderer value={article.body} />
        </div>

        {article.worlds && article.worlds.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {article.worlds.map((world) => (
              <Link key={world._id} href={`/wiki/${world.slug}`}>
                <Badge variant="muted">{world.name}</Badge>
              </Link>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
