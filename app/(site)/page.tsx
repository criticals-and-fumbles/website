import Link from "next/link";
import { client } from "@/sanity/lib/client";
import {
  HOME_LATEST_ARTICLES_QUERY,
  HOME_NEXT_MAJOR_EVENT_QUERY,
  HOME_UPCOMING_EVENTS_QUERY,
  HOME_WORLDS_QUERY,
  PHILOSOPHY_QUERY,
} from "@/sanity/lib/queries";
import { ARTICLE_CATEGORIES } from "@/sanity/schemas/constants";
import type {
  ArticleCard,
  MajorEventCardData,
  Philosophy,
  World,
} from "@/sanity/lib/types";
import { Hero } from "@/components/home/Hero";
import { ArticleStrip } from "@/components/home/ArticleStrip";
import { EventStrip } from "@/components/home/EventStrip";
import { WorldStrip } from "@/components/home/WorldStrip";
import { PhilosophyStrip } from "@/components/home/PhilosophyStrip";
import { NewsletterStrip } from "@/components/home/NewsletterStrip";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function HomePage() {
  const [latestArticles, nextEvent, upcomingEvents, worlds, philosophy] =
    await Promise.all([
      client.fetch<ArticleCard[]>(HOME_LATEST_ARTICLES_QUERY),
      client.fetch<MajorEventCardData | null>(HOME_NEXT_MAJOR_EVENT_QUERY),
      client.fetch<MajorEventCardData[]>(HOME_UPCOMING_EVENTS_QUERY),
      client.fetch<World[]>(HOME_WORLDS_QUERY),
      client.fetch<Philosophy | null>(PHILOSOPHY_QUERY),
    ]);

  return (
    <>
      <Hero nextEvent={nextEvent} fallbackArticle={latestArticles[0] ?? null} />

      <ArticleStrip articles={latestArticles} />

      <section className="border-y border-border bg-surface px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto">
          {ARTICLE_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/articles?category=${encodeURIComponent(category)}`}
              className="shrink-0 rounded-full border border-border px-4 py-2 font-ui text-xs text-text-muted transition-colors hover:border-emerald hover:text-emerald"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <EventStrip events={upcomingEvents} />

      <WorldStrip worlds={worlds} />

      <PhilosophyStrip tagline={philosophy?.tagline} />

      <NewsletterStrip />

      <Footer />
    </>
  );
}
