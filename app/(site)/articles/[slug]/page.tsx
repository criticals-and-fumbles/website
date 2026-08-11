import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { Article } from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { Badge } from "@/components/ui/Badge";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import { ArticleStructuredData } from "@/components/seo/ArticleStructuredData";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch<Article | null>(ARTICLE_BY_SLUG_QUERY, { slug });
  if (!article) return {};

  return buildMetadata({
    title: article.title,
    description:
      article.excerpt ??
      `Read "${article.title}" on Criticals and Fumbles, Singapore's tabletop RPG community.`,
    path: `/articles/${slug}`,
    image: urlForImage(article.coverImage)?.width(1200).height(630).url(),
    type: "article",
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = await client.fetch<Article | null>(ARTICLE_BY_SLUG_QUERY, {
    slug,
  });

  if (!article) notFound();

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
          excerpt: article.excerpt,
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

      <Footer pageFooterCTA={article.pageFooterCTA} />
    </>
  );
}
