import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, WORLD_UNIT_LORE_QUERY } from "@/sanity/lib/queries";
import type { LoreEntryCard, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { UnitLoreCard } from "@/components/wiki/UnitLoreCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/lore">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Lore`,
    description: `Lore entries scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/lore`,
  });
}

export default async function UnitLoreIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/lore">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const entries = await client.fetch<LoreEntryCard[]>(WORLD_UNIT_LORE_QUERY, {
    unitSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="lore" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Lore</h1>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No lore entries scoped to {unit.name} yet.
            </p>
          ) : (
            entries.map((entry) => (
              <UnitLoreCard
                key={entry._id}
                entry={entry}
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
