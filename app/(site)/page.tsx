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
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { CelestialHero } from "@/components/celestial/CelestialHero";
import { ChroniclesGrid } from "@/components/celestial/ChroniclesGrid";
import { LivingGrimoireFeed } from "@/components/celestial/LivingGrimoireFeed";
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
      {/* 2026-09-15: homepage now matches /celestial's look (the user's
          explicit reference) — astrolabe backdrop + ornate-card panels
          sitewide-available since globals.css/PageBackdrop.tsx exposed
          them beyond that one route. See docs/design-system.md for the
          full/subtle page tiering this implements. */}
      <PageBackdrop tier="full" />

      {/* /celestial's own layout (app/celestial/layout.tsx) supplies this
          same px-5/sm:px-10/md:px-16 + max-w-[1720px] wrapper around
          everything for that route — CelestialHero/ChroniclesGrid/
          LivingGrimoireFeed all assume it's already there and don't add
          their own horizontal padding, so it has to be reproduced here. */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-10 md:px-16">
        <CelestialHero
          siteSettings={siteSettings}
          rssFeed={allUpdates}
          pinnedEvent={pinnedEvent}
        />

        <ChroniclesGrid articles={latestArticles} />

        <LivingGrimoireFeed items={allUpdates} />
      </div>

      <EventStrip events={upcomingEvents} />

      <WorldStrip worlds={worlds} />

      <PhilosophyStrip tagline={philosophy?.tagline} />

      {/* Hidden until the newsletter is ready to develop — see NewsletterStrip.tsx */}
      {/* <NewsletterStrip /> */}

      <Footer />
    </>
  );
}
