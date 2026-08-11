import Image from "next/image";
import Link from "next/link";
import type { FactionCard as FactionCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";

export function FactionCard({
  faction,
  worldSlug,
  unitSlug,
}: {
  faction: FactionCardData;
  worldSlug: string;
  unitSlug: string;
}) {
  const imageUrl = urlForImage(faction.banner)
    ?.width(200)
    .height(200)
    .auto("format")
    .url();

  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/factions/${faction.slug}`}
      className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-emerald"
    >
      {imageUrl && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-bg-forest">
          <Image src={imageUrl} alt={faction.name} fill className="object-cover" />
        </div>
      )}
      <div>
        <h3 className="font-display text-xl text-text">{faction.name}</h3>
        {faction.factionType && (
          <p className="text-xs text-text-muted">{faction.factionType}</p>
        )}
      </div>
    </Link>
  );
}
