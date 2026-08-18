import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import {
  SITEMAP_ARTICLES_QUERY,
  SITEMAP_EVENTS_QUERY,
  SITEMAP_WORLDS_QUERY,
} from "@/sanity/lib/queries";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.criticalsandfumbles.com").replace(/\/$/, "");

interface SlugRow {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events, worlds] = await Promise.all([
    client.fetch<SlugRow[]>(SITEMAP_ARTICLES_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_EVENTS_QUERY),
    client.fetch<SlugRow[]>(SITEMAP_WORLDS_QUERY),
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

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
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

  return [...staticPages, ...articlePages, ...eventPages, ...worldPages];
}
