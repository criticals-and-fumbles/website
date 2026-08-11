import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { MAGIC_ITEM_QUERY } from "@/sanity/lib/queries";
import type { MagicItem } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { ItemMechanicsCard } from "@/components/wiki/ItemMechanicsCard";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

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
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
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

      <Footer />
    </>
  );
}
