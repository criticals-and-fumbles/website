import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, UNIT_NOTABLE_PLACES_QUERY } from "@/sanity/lib/queries";
import type { NotablePlaceCard as NotablePlaceCardData, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { NotablePlaceCard } from "@/components/wiki/NotablePlaceCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/places">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Notable Places`,
    description: `Notable places scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/places`,
  });
}

export default async function UnitNotablePlacesIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/places">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const places = await client.fetch<NotablePlaceCardData[]>(
    UNIT_NOTABLE_PLACES_QUERY,
    { unitSlug },
  );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="places" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Notable Places</h1>

        <h2 className="sr-only">All Notable Places</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No notable places scoped to {unit.name} yet.
            </p>
          ) : (
            places.map((place) => (
              <NotablePlaceCard
                key={place._id}
                place={place}
                worldSlug={worldSlug}
                unitSlug={unitSlug}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
