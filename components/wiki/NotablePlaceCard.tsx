import Link from "next/link";
import type { NotablePlaceCard as NotablePlaceCardData } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

const DANGER_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  safe: "emerald",
  "low-risk": "muted",
  dangerous: "amber",
  deadly: "magenta",
};

export function NotablePlaceCard({
  place,
  worldSlug,
  unitSlug,
}: {
  place: NotablePlaceCardData;
  worldSlug: string;
  unitSlug: string;
}) {
  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/places/${place.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-emerald"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl text-text">{place.name}</h3>
        {place.dangerLevel && (
          <Badge variant={DANGER_VARIANT[place.dangerLevel] ?? "muted"}>
            {place.dangerLevel}
          </Badge>
        )}
      </div>
      {place.placeType && <p className="text-xs text-text-muted">{place.placeType}</p>}
    </Link>
  );
}
