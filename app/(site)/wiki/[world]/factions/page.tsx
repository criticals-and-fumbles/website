import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_BY_SLUG_QUERY, WORLD_FACTIONS_QUERY } from "@/sanity/lib/queries";
import type { FactionCard as FactionCardData, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { FactionCard } from "@/components/wiki/FactionCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/factions">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) return {};

  return buildMetadata({
    title: `${world.name} — Factions`,
    description: `Browse factions from ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}/factions`,
  });
}

export default async function WorldFactionsIndexPage({
  params,
}: PageProps<"/wiki/[world]/factions">) {
  const { world: worldSlug } = await params;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) notFound();

  const factions = await client.fetch<FactionCardData[]>(WORLD_FACTIONS_QUERY, { worldSlug });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="factions" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{world.name} — Factions</h1>
        <h2 className="sr-only">All Factions</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {factions.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No factions in {world.name} yet.
            </p>
          ) : (
            factions.map((faction) => (
              <FactionCard key={faction._id} faction={faction} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
