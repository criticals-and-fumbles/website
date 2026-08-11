import Image from "next/image";
import Link from "next/link";
import type { LoreEntryCard } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { CanonBadge } from "@/components/ui/CanonBadge";

export function UnitLoreCard({
  entry,
  worldSlug,
  unitSlug,
}: {
  entry: LoreEntryCard;
  worldSlug: string;
  unitSlug: string;
}) {
  const imageUrl = urlForImage(entry.coverImage)
    ?.width(500)
    .height(300)
    .auto("format")
    .url();

  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/lore/${entry.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-emerald"
    >
      {imageUrl && (
        <div className="relative aspect-[5/3] w-full overflow-hidden bg-bg-forest">
          <Image src={imageUrl} alt={entry.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-2">
          {entry.category && <Badge variant="amber">{entry.category}</Badge>}
          <CanonBadge status={entry.canonStatus} />
        </div>
        <h3 className="font-display text-xl text-text">{entry.title}</h3>
        {entry.summary && (
          <p className="card-description line-clamp-2 text-text-muted">{entry.summary}</p>
        )}
      </div>
    </Link>
  );
}
