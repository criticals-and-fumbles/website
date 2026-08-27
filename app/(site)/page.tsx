import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  HOME_LATEST_ARTICLES_QUERY,
  HOME_PINNED_EVENT_QUERY,
  HOME_RSS_FEED_QUERY,
  HOME_UPCOMING_EVENTS_QUERY,
  HOME_WORLDS_QUERY,
  PHILOSOPHY_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { ARTICLE_CATEGORIES } from "@/sanity/schemas/constants";
import type {
  ArticleCard,
  HomeUpcomingEvent,
  HomeUpcomingEventsResult,
  PinnedEvent,
  Philosophy,
  RssFeedData,
  SiteSettings,
  World,
} from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { Hero } from "@/components/home/Hero";
import { ArticleStrip } from "@/components/home/ArticleStrip";
import { EventStrip } from "@/components/home/EventStrip";
import { WorldStrip } from "@/components/home/WorldStrip";
import { PhilosophyStrip } from "@/components/home/PhilosophyStrip";
// import { NewsletterStrip } from "@/components/home/NewsletterStrip"; // hidden until ready — see below
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Criticals and Fumbles | Singapore TTRPG Community",
  description:
    "Singapore's tabletop RPG community since 2016. Find D&D games, join " +
    "campaigns, and discover a table that feels like home.",
  path: "/",
});

export default async function HomePage() {
  const [latestArticles, pinnedEvent, rssFeedRaw, upcomingEventsRaw, worlds, philosophy, siteSettings] =
    await Promise.all([
      client.fetch<ArticleCard[]>(HOME_LATEST_ARTICLES_QUERY),
      client.fetch<PinnedEvent | null>(HOME_PINNED_EVENT_QUERY),
      client.fetch<RssFeedData>(HOME_RSS_FEED_QUERY),
      client.fetch<HomeUpcomingEventsResult>(HOME_UPCOMING_EVENTS_QUERY),
      client.fetch<World[]>(HOME_WORLDS_QUERY),
      client.fetch<Philosophy | null>(PHILOSOPHY_QUERY),
      client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
    ]);

  const upcomingEvents: HomeUpcomingEvent[] = [
    ...upcomingEventsRaw.major.map((e) => ({ ...e, _type: "majorEvent" as const })),
    ...upcomingEventsRaw.regular.map((e) => ({ ...e, _type: "regularEvent" as const })),
  ]
    .sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime())
    .slice(0, 3);

  const allUpdates = [
    ...rssFeedRaw.articles,
    ...rssFeedRaw.events,
    ...rssFeedRaw.lore,
    ...rssFeedRaw.sessions,
    ...rssFeedRaw.team,
    ...rssFeedRaw.worldUnits,
    ...rssFeedRaw.keyFigures,
    ...rssFeedRaw.notablePlaces,
    ...rssFeedRaw.magicItems,
    ...rssFeedRaw.factions,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <Hero
        pinnedEvent={pinnedEvent}
        rssFeed={allUpdates}
        discordUrl={siteSettings?.discordUrl}
      />

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

      {/* Hidden until the newsletter is ready to develop — see NewsletterStrip.tsx */}
      {/* <NewsletterStrip /> */}

      <Footer />
    </>
  );
}
