import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import {
  MAJOR_EVENTS_PAST_QUERY,
  MAJOR_EVENTS_UPCOMING_QUERY,
  REGULAR_EVENTS_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { MajorEventCardData, RegularEvent } from "@/sanity/lib/types";
import { MajorEventCard } from "@/components/events/MajorEventCard";
import { EventCard } from "@/components/events/EventCard";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

interface PastEvent {
  _id: string;
  title: string;
  slug: string;
  eventDate?: string;
  coverImage?: MajorEventCardData["coverImage"];
}

export default async function EventsPage() {
  const [upcomingMajor, regularEvents, pastEvents] = await Promise.all([
    client.fetch<MajorEventCardData[]>(MAJOR_EVENTS_UPCOMING_QUERY),
    client.fetch<RegularEvent[]>(REGULAR_EVENTS_QUERY),
    client.fetch<PastEvent[]>(MAJOR_EVENTS_PAST_QUERY),
  ]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Events</h1>

        <section className="mt-12">
          <h2 className="mb-6 font-display text-3xl text-text">
            Upcoming Events
          </h2>
          {upcomingMajor.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {upcomingMajor.map((event) => (
                <MajorEventCard key={event._id} event={event} />
              ))}
            </div>
          )}

          {regularEvents.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regularEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}

          {upcomingMajor.length === 0 && regularEvents.length === 0 && (
            <p className="text-sm text-text-muted">
              Nothing on the calendar right now — check back soon.
            </p>
          )}
        </section>

        {pastEvents.length > 0 && (
          <details className="mt-16 border-t border-border pt-8">
            <summary className="cursor-pointer font-display text-3xl text-text">
              Past Events
            </summary>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => {
                const imageUrl = urlForImage(event.coverImage)
                  ?.width(400)
                  .height(240)
                  .auto("format")
                  .url();
                return (
                  <Link
                    key={event._id}
                    href={`/events/${event.slug}`}
                    className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface"
                  >
                    {imageUrl && (
                      <div className="relative aspect-[5/3] w-full overflow-hidden bg-bg-forest">
                        <Image
                          src={imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display text-xl text-text">
                        {event.title}
                      </h3>
                      {event.eventDate && (
                        <p className="font-ui text-xs text-text-muted">
                          {event.eventDate}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </details>
        )}
      </div>

      <Footer />
    </>
  );
}
