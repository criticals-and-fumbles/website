import Link from "next/link";
import type { RegularEvent } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";

export function EventCard({ event }: { event: RegularEvent }) {
  const detailHref = `/events/${event.slug}`;
  const ctaHref = event.registrationUrl ?? detailHref;
  const ctaLabel = event.registrationUrl ? "Register" : "View Details";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-emerald">
      <Link href={detailHref} className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl text-text">
            {event.campaignName ?? event.title}
          </h3>
          {event.status && <Badge variant="emerald">{event.status}</Badge>}
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-ui text-xs text-text-muted">
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
      </Link>
      <LinkButton
        href={ctaHref}
        external={Boolean(event.registrationUrl)}
        variant="primary"
        className="mt-2 w-full"
      >
        {ctaLabel}
      </LinkButton>
    </div>
  );
}
