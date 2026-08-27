import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_BY_SLUG_QUERY, WORLD_MAGIC_ITEMS_QUERY } from "@/sanity/lib/queries";
import type { MagicItemCard as MagicItemCardData, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { MagicItemCard } from "@/components/wiki/MagicItemCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/items">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) return {};

  return buildMetadata({
    title: `${world.name} — Magic Items`,
    description: `Browse magic items from ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}/items`,
  });
}

export default async function WorldMagicItemsIndexPage({
  params,
}: PageProps<"/wiki/[world]/items">) {
  const { world: worldSlug } = await params;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, { slug: worldSlug });
  if (!world) notFound();

  const items = await client.fetch<MagicItemCardData[]>(WORLD_MAGIC_ITEMS_QUERY, { worldSlug });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="items" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{world.name} — Magic Items</h1>
        <h2 className="sr-only">All Magic Items</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No magic items in {world.name} yet.
            </p>
          ) : (
            items.map((item) => (
              <MagicItemCard key={item._id} item={item} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
