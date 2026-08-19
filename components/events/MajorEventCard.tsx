import Image from "next/image";
import Link from "next/link";
import type { MajorEventCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";

const STATUS_LABELS: Record<MajorEventCardData["status"], string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<
  MajorEventCardData["status"],
  "emerald" | "amber" | "magenta" | "muted"
> = {
  "watch-this-space": "muted",
  "coming-soon": "amber",
  "registration-open": "emerald",
  full: "magenta",
  completed: "muted",
  cancelled: "muted",
};

export function MajorEventCard({ event }: { event: MajorEventCardData }) {
  const imageUrl = urlForImage(event.splashImage ?? event.coverImage)
    ?.width(900)
    .height(500)
    .auto("format")
    .url();
  const detailHref = `/events/${event.slug}`;
  const ctaHref = event.registrationUrl ?? detailHref;
  const ctaLabel = event.registrationUrl ? "Register" : "View Details";

  return (
    // Full-width list row instead of a stacked card — same shape as the
    // campaigns subsite's directory list (image capped narrow on the
    // left, content filling the rest) since Major Events are the
    // highest-priority items on this page and should read as a list of
    // headline items, not compete for space in a grid the way Regular
    // Events (EventCard) do.
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-emerald sm:flex sm:flex-row">
      <Link
        href={detailHref}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-bg-forest sm:aspect-auto sm:w-1/4 sm:max-w-xs sm:flex-shrink-0"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href={detailHref} className="flex flex-1 flex-col gap-3">
          <Badge variant={STATUS_VARIANTS[event.status]}>
            {STATUS_LABELS[event.status]}
          </Badge>
          <h3 className="font-display text-3xl text-text">{event.title}</h3>
          {event.tagline && <p className="text-text-muted">{event.tagline}</p>}
          <div className="flex flex-wrap items-center gap-4 font-ui text-xs text-text-muted">
            {event.eventDate && <span>{event.eventDate}</span>}
            {event.location && <span>{event.location}</span>}
          </div>
          {event.startDate && event.status === "registration-open" && (
            <CountdownTimer target={event.startDate} />
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
