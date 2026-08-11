import Image from "next/image";
import Link from "next/link";
import type { MagicItemCard as MagicItemCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

const RARITY_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  common: "muted",
  uncommon: "emerald",
  rare: "amber",
  "very-rare": "amber",
  legendary: "magenta",
  artifact: "magenta",
};

export function MagicItemCard({
  item,
  worldSlug,
  unitSlug,
}: {
  item: MagicItemCardData;
  worldSlug: string;
  unitSlug: string;
}) {
  const imageUrl = urlForImage(item.itemArt)
    ?.width(500)
    .height(300)
    .auto("format")
    .url();

  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/items/${item.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-emerald"
    >
      {imageUrl && (
        <div className="relative aspect-[5/3] w-full overflow-hidden bg-bg-forest">
          <Image src={imageUrl} alt={item.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl text-text">{item.name}</h3>
        {item.rarity && (
          <Badge variant={RARITY_VARIANT[item.rarity] ?? "muted"}>{item.rarity}</Badge>
        )}
      </div>
    </Link>
  );
}
