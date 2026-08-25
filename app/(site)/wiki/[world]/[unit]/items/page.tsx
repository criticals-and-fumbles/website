import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, UNIT_MAGIC_ITEMS_QUERY } from "@/sanity/lib/queries";
import type { MagicItemCard as MagicItemCardData, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { MagicItemCard } from "@/components/wiki/MagicItemCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/items">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Magic Items`,
    description: `Magic items scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/items`,
  });
}

export default async function UnitMagicItemsIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/items">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const items = await client.fetch<MagicItemCardData[]>(UNIT_MAGIC_ITEMS_QUERY, {
    unitSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="items" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Magic Items</h1>

        <h2 className="sr-only">All Magic Items</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No magic items scoped to {unit.name} yet.
            </p>
          ) : (
            items.map((item) => (
              <MagicItemCard
                key={item._id}
                item={item}
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
