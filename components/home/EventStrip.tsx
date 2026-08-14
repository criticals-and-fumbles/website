import Image from "next/image";
import Link from "next/link";
import type { HomeUpcomingEvent } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";

const STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
};

export function EventStrip({ events }: { events: HomeUpcomingEvent[] }) {
  return (
    <section className="bg-surface px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-4xl text-text">Upcoming Events</h2>
          <LinkButton href="/events" variant="ghost">
            All Events →
          </LinkButton>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-text-muted">No events scheduled — watch this space.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const imageUrl = urlForImage(event.coverImage)
                ?.width(500)
                .height(300)
                .auto("format")
                .url();
              const detailHref = `/events/${event.slug}`;
              const isMajor = event._type === "majorEvent";
              const ctaHref = event.registrationUrl ?? detailHref;
              const ctaLabel = event.registrationUrl ? "Register" : "View Details";
              const ctaExternal = Boolean(event.registrationUrl);

              return (
                <div
                  key={event._id}
                  className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg transition-colors hover:border-emerald"
                >
                  <Link href={detailHref} className="flex flex-1 flex-col">
                    {imageUrl && (
                      <div className="relative aspect-[5/3] w-full overflow-hidden bg-bg-forest">
                        <Image src={imageUrl} alt={event.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4 pb-0">
                      {isMajor ? (
                        <>
                          {event.eventDate && (
                            <span className="font-ui text-xs text-text-muted">
                              {event.eventDate}
                            </span>
                          )}
                          <h3 className="font-display text-xl text-text">{event.title}</h3>
                          {event.location && (
                            <p className="text-sm text-text-muted">{event.location}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="font-display text-xl text-text">
                            {event.campaignName ?? event.title}
                          </h3>
                          {event.schedule && (
                            <p className="text-sm text-text-muted">{event.schedule}</p>
                          )}
                        </>
                      )}
                      <Badge
                        variant={isMajor ? "amber" : "emerald"}
                        className="mt-auto self-start"
                      >
                        {isMajor
                          ? (STATUS_LABELS[event.status ?? ""] ?? event.status)
                          : "Regular Session"}
                      </Badge>
                    </div>
                  </Link>
                  <div className="p-4 pt-3">
                    <LinkButton
                      href={ctaHref}
                      external={ctaExternal}
                      variant="primary"
                      className="w-full"
                    >
                      {ctaLabel}
                    </LinkButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
