import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, UNIT_KEY_FIGURES_QUERY } from "@/sanity/lib/queries";
import type { KeyFigureCard as KeyFigureCardData, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { KeyFigureCard } from "@/components/wiki/KeyFigureCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/figures">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Key Figures`,
    description: `Key figures scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/figures`,
  });
}

export default async function UnitKeyFiguresIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/figures">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const figures = await client.fetch<KeyFigureCardData[]>(UNIT_KEY_FIGURES_QUERY, {
    unitSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="figures" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Key Figures</h1>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {figures.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No key figures scoped to {unit.name} yet.
            </p>
          ) : (
            figures.map((figure) => (
              <KeyFigureCard
                key={figure._id}
                figure={figure}
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
