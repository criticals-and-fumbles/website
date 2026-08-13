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
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-emerald">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-forest">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-col gap-3 p-6 pb-0">
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
        </div>
      </Link>
      <div className="p-6 pt-4">
        <LinkButton
          href={ctaHref}
          external={Boolean(event.registrationUrl)}
          variant="primary"
          className="w-full"
        >
          {ctaLabel}
        </LinkButton>
      </div>
    </div>
  );
}
