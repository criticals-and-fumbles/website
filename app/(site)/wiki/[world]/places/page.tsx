import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_BY_SLUG_QUERY, WORLD_NOTABLE_PLACES_QUERY } from "@/sanity/lib/queries";
import type { NotablePlaceCard as NotablePlaceCardData, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { NotablePlaceCard } from "@/components/wiki/NotablePlaceCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/places">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) return {};

  return buildMetadata({
    title: `${world.name} — Notable Places`,
    description: `Browse notable places from ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}/places`,
  });
}

export default async function WorldNotablePlacesIndexPage({
  params,
}: PageProps<"/wiki/[world]/places">) {
  const { world: worldSlug } = await params;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) notFound();

  const places = await client.fetch<NotablePlaceCardData[]>(WORLD_NOTABLE_PLACES_QUERY, {
    worldSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="places" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{world.name} — Notable Places</h1>
        <h2 className="sr-only">All Notable Places</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {places.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No notable places in {world.name} yet.
            </p>
          ) : (
            places.map((place) => (
              <NotablePlaceCard key={place._id} place={place} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
