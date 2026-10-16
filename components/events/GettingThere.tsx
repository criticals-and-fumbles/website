import type { Venue } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Renderer } from "@/components/portable-text/Renderer";

/**
 * "How to get there" section for an event page. Driven by a linked `venue`
 * document; `fallbackLocation` is the legacy plain-text `location` string,
 * used only when no venue is linked yet. Private venues never show an
 * address or map link (see sanity/schemas/venue.ts).
 */
export function GettingThere({
  venue,
  fallbackLocation,
  id,
}: {
  venue?: Venue | null;
  fallbackLocation?: string;
  id?: string;
}) {
  if (!venue && !fallbackLocation) return null;

  const isPrivate = venue?.visibility === "private";
  const name = venue?.name ?? fallbackLocation;

  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="rounded-lg border border-border bg-surface/75 p-5"
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="font-ui text-sm uppercase tracking-wider text-text-muted"
      >
        How to get there
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="font-display text-2xl text-text">{name}</p>
        {venue && (
          <Badge variant={isPrivate ? "amber" : "emerald"}>
            {isPrivate ? "Private venue" : "Public venue"}
          </Badge>
        )}
      </div>

      {isPrivate
        ? venue?.privateNote && (
            <p className="mt-3 text-sm text-text-muted">{venue.privateNote}</p>
          )
        : venue?.address && (
            <address className="mt-3 whitespace-pre-line text-sm not-italic text-text-muted">
              {venue.address}
            </address>
          )}

      {venue?.nearestTransit && (
        <p className="mt-3 text-sm text-text-muted">
          <span className="text-text">Nearest MRT/bus:</span> {venue.nearestTransit}
        </p>
      )}

      {venue?.directions && venue.directions.length > 0 && (
        <div className="mt-3 text-sm">
          <Renderer value={venue.directions} />
        </div>
      )}

      {venue?.accessNotes && (
        <p className="mt-3 text-sm text-text-muted">
          <span className="text-text">Access:</span> {venue.accessNotes}
        </p>
      )}

      {!isPrivate && venue?.googleMapsUrl && (
        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-ui text-sm text-emerald hover:underline"
        >
          Open in Google Maps →
        </a>
      )}
    </section>
  );
}
