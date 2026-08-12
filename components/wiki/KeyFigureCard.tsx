import Image from "next/image";
import Link from "next/link";
import type { KeyFigureCard as KeyFigureCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

const THREAT_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  friendly: "emerald",
  neutral: "muted",
  cautious: "amber",
  dangerous: "amber",
  deadly: "magenta",
};

export function KeyFigureCard({
  figure,
  worldSlug,
  unitSlug,
}: {
  figure: KeyFigureCardData;
  worldSlug: string;
  unitSlug: string;
}) {
  const imageUrl = urlForImage(figure.portrait)
    ?.width(300)
    .height(300)
    .auto("format")
    .url();

  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/figures/${figure.slug}`}
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-5 text-center transition-colors hover:border-emerald"
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-bg-forest">
        {imageUrl && (
          <Image src={imageUrl} alt={figure.name} fill className="object-cover" />
        )}
      </div>
      <h3 className="font-display text-xl text-text">{figure.name}</h3>
      {figure.role && <p className="text-xs text-text-muted">{figure.role}</p>}
      {figure.threatLevel && (
        <Badge variant={THREAT_VARIANT[figure.threatLevel] ?? "muted"}>
          {figure.threatLevel}
        </Badge>
      )}
    </Link>
  );
}
