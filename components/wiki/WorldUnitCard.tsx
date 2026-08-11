import Image from "next/image";
import Link from "next/link";
import type { WorldUnitCard as WorldUnitCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "amber" | "emerald" | "magenta" } | undefined
> = {
  "in-progress": { label: "In Progress", variant: "amber" },
  established: { label: "Established", variant: "emerald" },
  canonical: { label: "Canonical", variant: "magenta" },
};

export function WorldUnitCard({
  unit,
  worldSlug,
}: {
  unit: WorldUnitCardData;
  worldSlug: string;
}) {
  const isDraft = unit.developmentStatus === "draft";
  const badge = unit.developmentStatus ? STATUS_BADGE[unit.developmentStatus] : undefined;
  const imageUrl = urlForImage(unit.coverImage)
    ?.width(600)
    .height(400)
    .auto("format")
    .url();
  const accent = unit.colourAccent ?? "var(--emerald)";

  const cardContent = (
    <>
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={unit.name}
            fill
            className={`object-cover ${isDraft ? "opacity-40 grayscale" : ""}`}
          />
        )}
        {isDraft && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="font-ui text-sm uppercase tracking-wider text-white">
              Coming Soon
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-display text-2xl"
            style={{ color: isDraft ? undefined : accent }}
          >
            {unit.name}
          </h3>
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        </div>
        {unit.dmOwner && (
          <p className="font-ui text-xs text-text-muted">DM: {unit.dmOwner.handle}</p>
        )}
      </div>
    </>
  );

  if (isDraft) {
    return (
      <div className="flex cursor-not-allowed flex-col overflow-hidden rounded-lg border border-border bg-surface opacity-70">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/wiki/${worldSlug}/${unit.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-emerald"
    >
      {cardContent}
    </Link>
  );
}
