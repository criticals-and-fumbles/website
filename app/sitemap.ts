import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import {
  SITEMAP_ARTICLES_QUERY,
  SITEMAP_EVENTS_QUERY,
  SITEMAP_FACTIONS_QUERY,
  SITEMAP_KEY_FIGURES_QUERY,
  SITEMAP_LORE_ENTRIES_QUERY,
  SITEMAP_MAGIC_ITEMS_QUERY,
  SITEMAP_NOTABLE_PLACES_QUERY,
  SITEMAP_REGULAR_EVENTS_QUERY,
  SITEMAP_SESSION_LOGS_QUERY,
  SITEMAP_TEAM_MEMBERS_QUERY,
  SITEMAP_WORLD_UNITS_QUERY,
  SITEMAP_WORLDS_QUERY,
} from "@/sanity/lib/queries";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.criticalsandfumbles.com").replace(/\/$/, "");

interface SlugRow {
  slug: string;
  _updatedAt: string;
}

interface WorldScopedSlugRow extends SlugRow {
  worldSlug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    articles,
    events,
    regularEvents,
    worlds,
    teamMembers,
    worldUnits,
    loreEntries,
    sessionLogs,
    keyFigures,
    notablePlaces,
    magicItems,
    factions,
  ] = await Promise.all([
    client.fetch<SlugRow[]>(SITEMAP_ARTICLES_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_EVENTS_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_REGULAR_EVENTS_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_WORLDS_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_TEAM_MEMBERS_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_WORLD_UNITS_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_LORE_ENTRIES_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_SESSION_LOGS_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_KEY_FIGURES_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_NOTABLE_PLACES_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_MAGIC_ITEMS_QUERY),
    client.fetch<WorldScopedSlugRow[]>(SITEMAP_FACTIONS_QUERY),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/team`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/wiki`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/resources`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a._updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const eventPages: MetadataRoute.Sitemap = [...events, ...regularEvents].map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: e._updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const worldPages: MetadataRoute.Sitemap = worlds.map((w) => ({
    url: `${SITE_URL}/wiki/${w.slug}`,
    lastModified: w._updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const teamPages: MetadataRoute.Sitemap = teamMembers.map((m) => ({
    url: `${SITE_URL}/team/${m.slug}`,
    lastModified: m._updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const worldUnitPages: MetadataRoute.Sitemap = worldUnits.map((u) => ({
    url: `${SITE_URL}/wiki/${u.worldSlug}/${u.slug}`,
    lastModified: u._updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const lorePages: MetadataRoute.Sitemap = loreEntries.map((l) => ({
    url: `${SITE_URL}/wiki/${l.worldSlug}/lore/${l.slug}`,
    lastModified: l._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const sessionPages: MetadataRoute.Sitemap = sessionLogs.map((s) => ({
    url: `${SITE_URL}/wiki/${s.worldSlug}/sessions/${s.slug}`,
    lastModified: s._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const keyFigurePages: MetadataRoute.Sitemap = keyFigures.map((k) => ({
    url: `${SITE_URL}/wiki/${k.worldSlug}/figures/${k.slug}`,
    lastModified: k._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const notablePlacePages: MetadataRoute.Sitemap = notablePlaces.map((p) => ({
    url: `${SITE_URL}/wiki/${p.worldSlug}/places/${p.slug}`,
    lastModified: p._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const magicItemPages: MetadataRoute.Sitemap = magicItems.map((i) => ({
    url: `${SITE_URL}/wiki/${i.worldSlug}/items/${i.slug}`,
    lastModified: i._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const factionPages: MetadataRoute.Sitemap = factions.map((f) => ({
    url: `${SITE_URL}/wiki/${f.worldSlug}/factions/${f.slug}`,
    lastModified: f._updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...articlePages,
    ...eventPages,
    ...worldPages,
    ...teamPages,
    ...worldUnitPages,
    ...lorePages,
    ...sessionPages,
    ...keyFigurePages,
    ...notablePlacePages,
    ...magicItemPages,
    ...factionPages,
  ];
}
