import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { HOME_LATEST_ARTICLES_QUERY, HOME_RSS_FEED_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { ArticleCard, RssFeedData, SiteSettings } from "@/sanity/lib/types";
import { CelestialHero } from "@/components/celestial/CelestialHero";
import { ChroniclesGrid } from "@/components/celestial/ChroniclesGrid";
import { LivingGrimoireFeed } from "@/components/celestial/LivingGrimoireFeed";
import { CelestialFooter } from "@/components/celestial/CelestialFooter";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Criticals and Fumbles — Celestial Preview",
  robots: { index: false, follow: false },
};

/**
 * /celestial — alternative homepage preview, built from the approved
 * code.html mockup ("TTRPGs with a Twist" celestial/astrolabe direction).
 * Replaces the earlier /lobby preview entirely (scrapped per the user's
 * decision — see docs/components.md history / this session's review).
 *
 * All content is real Sanity data via existing queries — no new query
 * needed for this page. Reuses the exact same merged/sorted RSS feed
 * (HOME_RSS_FEED_QUERY) for both the hero's Live Dispatches widget and
 * the full Living Grimoire section below it, and HOME_LATEST_ARTICLES_QUERY
 * for the Chronicles grid, same as the current homepage and the earlier
 * /lobby preview both already did.
 */
export default async function CelestialPage() {
  const [siteSettings, rssFeedRaw, latestArticles] = await Promise.all([
    client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
    client.fetch<RssFeedData>(HOME_RSS_FEED_QUERY),
    client.fetch<ArticleCard[]>(HOME_LATEST_ARTICLES_QUERY),
  ]);

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
      <CelestialHero siteSettings={siteSettings} rssFeed={allUpdates} />
      <ChroniclesGrid articles={latestArticles} />
      <LivingGrimoireFeed items={allUpdates} />
      <CelestialFooter siteSettings={siteSettings} />
    </>
  );
}
