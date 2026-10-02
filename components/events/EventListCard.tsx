import Image from "next/image";
import Link from "next/link";
import type { EventListItem } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";

/** Both event types' status vocabularies, mapped to one consistent badge
 * treatment. Keyed by the raw status string as each schema actually
 * stores it (majorEvent: lowercase-hyphenated; regularEvent: Title
 * Case) — the two never collide, so one flat map covers both rather
 * than needing a per-type lookup. `recruiting` here is also what
 * isRecruiting() in app/(site)/events/page.tsx sorts/filters on — the
 * single source of truth for "does this status count as open to join." */
const STATUS_META: Record<string, { label: string; variant: "emerald" | "amber" | "magenta" | "muted"; recruiting: boolean }> = {
  "watch-this-space": { label: "Watch This Space", variant: "muted", recruiting: false },
  "coming-soon": { label: "Coming Soon", variant: "amber", recruiting: false },
  "registration-open": { label: "Registration Open", variant: "emerald", recruiting: true },
  full: { label: "Full", variant: "magenta", recruiting: false },
  completed: { label: "Completed", variant: "muted", recruiting: false },
  cancelled: { label: "Cancelled", variant: "muted", recruiting: false },
  Active: { label: "Active", variant: "emerald", recruiting: false },
  Recruiting: { label: "Recruiting", variant: "emerald", recruiting: true },
  Full: { label: "Full", variant: "magenta", recruiting: false },
  Hiatus: { label: "Hiatus", variant: "amber", recruiting: false },
  Ended: { label: "Ended", variant: "muted", recruiting: false },
};

export function isRecruiting(event: EventListItem): boolean {
  return Boolean(event.status && STATUS_META[event.status]?.recruiting);
}

export function EventListCard({ event }: { event: EventListItem }) {
  const detailHref = `/events/${event.slug}`;
  const ctaHref = event.registrationUrl ?? detailHref;
  const ctaLabel = event.registrationUrl ? "Register" : "View Details";
  const statusMeta = event.status ? STATUS_META[event.status] : undefined;

  const isMajor = event._type === "majorEvent";
  const imageUrl = isMajor
    ? urlForImage(event.splashImage ?? event.coverImage)
        ?.width(900)
        .height(500)
        .fit("max")
        .ignoreImageParams()
        .auto("format")
        .url()
    : urlForImage(event.coverImage)?.width(900).height(500).fit("max").ignoreImageParams().auto("format").url();

  const heading = isMajor ? event.title : event.campaignName ?? event.title;

  return (
    // Page-width single-column row — same shape MajorEventCard pioneered
    // (image capped narrow on the left, content filling the rest),
    // extended 2026-10-02 to cover regularEvent too so the whole /events
    // list is one consistent card type, not two differently-styled grids.
    <div className="group overflow-hidden rounded-xl border border-border bg-surface/75 transition-colors hover:border-emerald sm:flex sm:flex-row">
      <Link
        href={detailHref}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-bg-forest sm:aspect-auto sm:w-1/4 sm:max-w-xs sm:flex-shrink-0"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={heading}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href={detailHref} className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusMeta && <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>}
            {event.recommendedFor?.map((tag) => (
              <Badge key={tag} variant="surface">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-3xl text-text">{heading}</h3>

          {isMajor ? (
            <>
              {event.tagline && <p className="text-text-muted">{event.tagline}</p>}
              <div className="flex flex-wrap items-center gap-4 font-ui text-xs text-text-muted">
                {event.eventDate && <span>{event.eventDate}</span>}
                {event.location && <span>{event.location}</span>}
              </div>
              {event.startDate && event.status === "registration-open" && (
                <CountdownTimer target={event.startDate} />
              )}
            </>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-ui text-xs text-text-muted sm:grid-cols-3">
              {event.dm && (
                <>
                  <dt>DM</dt>
                  <dd className="text-text">{event.dm.handle}</dd>
                </>
              )}
              {event.world && (
                <>
                  <dt>World</dt>
                  <dd className="text-text">{event.world.name}</dd>
                </>
              )}
              {event.schedule && (
                <>
                  <dt>Schedule</dt>
                  <dd className="text-text">{event.schedule}</dd>
                </>
              )}
              {event.system && (
                <>
                  <dt>System</dt>
                  <dd className="text-text">{event.system}</dd>
                </>
              )}
              {event.playerCount && (
                <>
                  <dt>Players</dt>
                  <dd className="text-text">{event.playerCount}</dd>
                </>
              )}
            </dl>
          )}
        </Link>
        <div className="sm:flex-shrink-0">
          <LinkButton
            href={ctaHref}
            external={Boolean(event.registrationUrl)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {ctaLabel}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
