import Image from "next/image";
import type { Division } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";

export function DivisionCard({ division }: { division: Division }) {
  const logoUrl = urlForImage(division.logo)?.width(96).height(96).auto("format").url();

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
      {logoUrl ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-bg-forest">
          <Image src={logoUrl} alt={division.name} fill className="object-cover" />
        </div>
      ) : (
        <span className="text-4xl" aria-hidden="true">
          🎲
        </span>
      )}
      <h3 className="font-display text-2xl text-text">{division.name}</h3>
      {division.blurb && <p className="text-sm text-text-muted">{division.blurb}</p>}
      {typeof division.memberCount === "number" && division.memberCount > 0 && (
        <p className="font-ui text-xs text-text-muted">
          {division.memberCount} member{division.memberCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
