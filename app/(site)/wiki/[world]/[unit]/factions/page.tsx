import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, UNIT_FACTIONS_QUERY } from "@/sanity/lib/queries";
import type { FactionCard as FactionCardData, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { FactionCard } from "@/components/wiki/FactionCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/factions">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Factions`,
    description: `Factions scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/factions`,
  });
}

export default async function UnitFactionsIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/factions">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const factions = await client.fetch<FactionCardData[]>(UNIT_FACTIONS_QUERY, {
    worldSlug,
    unitSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="factions" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Factions</h1>

        <h2 className="sr-only">All Factions</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {factions.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No factions scoped to {unit.name} yet.
            </p>
          ) : (
            factions.map((faction) => (
              <FactionCard
                key={faction._id}
                faction={faction}
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
