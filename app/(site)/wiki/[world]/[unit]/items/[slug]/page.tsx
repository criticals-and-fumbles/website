import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { MAGIC_ITEM_QUERY } from "@/sanity/lib/queries";
import type { MagicItem } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { ItemMechanicsCard } from "@/components/wiki/ItemMechanicsCard";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata, plainTextFromBlocks } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/items/[slug]">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const item = await client.fetch<MagicItem | null>(MAGIC_ITEM_QUERY, { slug });
  if (!item) return {};

  return buildMetadata({
    title: item.name,
    description:
      plainTextFromBlocks(item.lore) ??
      `${item.name}${item.rarity ? `, a ${item.rarity} item` : ""} from ${item.unit?.name ?? item.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/items/${slug}`,
    image: urlForImage(item.itemArt)?.width(1200).height(630).url(),
  });
}

const RARITY_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  common: "muted",
  uncommon: "emerald",
  rare: "amber",
  "very-rare": "amber",
  legendary: "magenta",
  artifact: "magenta",
};

export default async function MagicItemPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/items/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const item = await client.fetch<MagicItem | null>(MAGIC_ITEM_QUERY, { slug });

  if (!item) notFound();

  const artUrl = urlForImage(item.itemArt)?.width(600).height(400).auto("format").url();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            {artUrl && (
              <div className="relative mb-6 aspect-[3/2] w-full overflow-hidden rounded-lg bg-bg-forest">
                <Image src={artUrl} alt={item.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {item.rarity && (
                <Badge variant={RARITY_VARIANT[item.rarity] ?? "muted"}>{item.rarity}</Badge>
              )}
              {item.itemType && <Badge variant="muted">{item.itemType}</Badge>}
            </div>
            <h1 className="mt-4 font-display text-5xl text-text">{item.name}</h1>

            {item.lore && (
              <div className="mt-10">
                <Renderer value={item.lore} />
              </div>
            )}

            {item.hasMechanics && item.mechanics && (
              <div className="mt-10">
                <ItemMechanicsCard name={item.name} mechanics={item.mechanics} />
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6 font-ui text-xs text-text-muted">
              {item.currentHolder && (
                <Link
                  href={`/wiki/${worldSlug}/${unitSlug}/figures/${item.currentHolder.slug}`}
                  className="hover:text-emerald"
                >
                  Held by {item.currentHolder.name}
                </Link>
              )}
              {item.foundAt && (
                <Link
                  href={`/wiki/${worldSlug}/${unitSlug}/places/${item.foundAt.slug}`}
                  className="hover:text-emerald"
                >
                  Found at {item.foundAt.name}
                </Link>
              )}
            </div>
          </article>

          {item._createdAt && item._updatedAt && (
            <WikiEntryMetaPanel
              title={item.name}
              image={item.itemArt}
              typeLabel="Magic Item"
              statusChip={
                item.rarity
                  ? { label: item.rarity, variant: RARITY_VARIANT[item.rarity] ?? "muted" }
                  : undefined
              }
              createdAt={item._createdAt}
              updatedAt={item._updatedAt}
              lastEditedByHandle={item.lastEditedBy?.handle}
              siblingsHeading={item.unit ? "In this unit" : "In this world"}
              siblings={(item.siblingEntries ?? []).map((s) => ({
                title: s.title,
                href: wikiSiblingHref(s),
              }))}
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
