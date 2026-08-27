import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_BY_SLUG_QUERY, WORLD_KEY_FIGURES_QUERY } from "@/sanity/lib/queries";
import type { KeyFigureCard as KeyFigureCardData, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { KeyFigureCard } from "@/components/wiki/KeyFigureCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/figures">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) return {};

  return buildMetadata({
    title: `${world.name} — Key Figures`,
    description: `Browse key figures from ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}/figures`,
  });
}

export default async function WorldKeyFiguresIndexPage({
  params,
}: PageProps<"/wiki/[world]/figures">) {
  const { world: worldSlug } = await params;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) notFound();

  const figures = await client.fetch<KeyFigureCardData[]>(WORLD_KEY_FIGURES_QUERY, { worldSlug });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="figures" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{world.name} — Key Figures</h1>
        <h2 className="sr-only">All Key Figures</h2>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {figures.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No key figures in {world.name} yet.
            </p>
          ) : (
            figures.map((figure) => (
              <KeyFigureCard key={figure._id} figure={figure} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
