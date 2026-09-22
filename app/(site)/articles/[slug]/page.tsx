import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { Article } from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { Footer } from "@/components/layout/Footer";
import { ArticleContent } from "@/components/articles/ArticleContent";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.criticalsandfumbles.com").replace(/\/$/, "");

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
      article.metaDescription ??
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

  return (
    <>
      <ArticleContent article={article} shareUrl={`${SITE_URL}/articles/${slug}`} />
      <Footer pageFooterCTA={article.pageFooterCTA} />
    </>
  );
}
