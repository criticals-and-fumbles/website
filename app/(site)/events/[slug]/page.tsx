import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import {
  GALLERY_PHOTOS_QUERY,
  MAJOR_EVENT_BY_SLUG_QUERY,
  MAJOR_EVENTS_UPCOMING_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { MajorEvent, MajorEventCardData } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/events/CountdownTimer";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

const STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function MajorEventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await client.fetch<MajorEvent | null>(MAJOR_EVENT_BY_SLUG_QUERY, {
    slug,
  });

  if (!event) notFound();

  const [photos, related] = await Promise.all([
    client.fetch<{ _id: string }[]>(GALLERY_PHOTOS_QUERY, {
      eventId: event._id,
    }),
    client.fetch<MajorEventCardData[]>(MAJOR_EVENTS_UPCOMING_QUERY),
  ]);

  const splashUrl = urlForImage(event.splashImage ?? event.coverImage)
    ?.width(1600)
    .height(700)
    .auto("format")
    .url();

  const relatedEvents = related.filter((e) => e._id !== event._id).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {splashUrl && (
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
            <Image src={splashUrl} alt={event.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <Badge variant="amber">{STATUS_LABELS[event.status] ?? event.status}</Badge>
            <h1 className="mt-3 font-display text-5xl text-text">{event.title}</h1>
            {event.tagline && <p className="mt-2 text-text-muted">{event.tagline}</p>}

            {event.startDate && event.status === "registration-open" && (
              <div className="mt-6">
                <CountdownTimer target={event.startDate} />
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6 font-ui text-xs sm:grid-cols-4">
              {event.eventDate && (
                <div>
                  <dt className="text-text-muted">Date</dt>
                  <dd className="mt-1 text-text">{event.eventDate}</dd>
                </div>
              )}
              {event.location && (
                <div>
                  <dt className="text-text-muted">Location</dt>
                  <dd className="mt-1 text-text">{event.location}</dd>
                </div>
              )}
              {event.capacity && (
                <div>
                  <dt className="text-text-muted">Capacity</dt>
                  <dd className="mt-1 text-text">{event.capacity}</dd>
                </div>
              )}
              {event.ticketPrice && (
                <div>
                  <dt className="text-text-muted">Ticket Price</dt>
                  <dd className="mt-1 text-text">{event.ticketPrice}</dd>
                </div>
              )}
            </dl>

            {event.watchThisSpaceTeaser && event.watchThisSpaceTeaser.length > 0 && (
              <Renderer value={event.watchThisSpaceTeaser} />
            )}
            <Renderer value={event.description} />

            {event.schedule && event.schedule.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl text-text">Schedule</h2>
                <Renderer value={event.schedule} />
              </div>
            )}

            {event.dms && event.dms.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl text-text">
                  Dungeon Master{event.dms.length > 1 ? "s" : ""}
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {event.dms.map((dm) => (
                    <Link
                      key={dm._id}
                      href={`/team/${dm.slug}`}
                      className="rounded-full border border-border px-4 py-2 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                    >
                      {dm.handle}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {event.registrationUrl && (
              <div className="mt-10">
                <LinkButton href={event.registrationUrl} external variant="primary">
                  Register →
                </LinkButton>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-10">
                <Link
                  href={`/gallery#${event.slug}`}
                  className="font-ui text-sm text-emerald hover:underline"
                >
                  View {photos.length} photo{photos.length > 1 ? "s" : ""} from
                  this event →
                </Link>
              </div>
            )}
          </div>

          {relatedEvents.length > 0 && (
            <aside className="space-y-4">
              <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                Related Events
              </h2>
              {relatedEvents.map((related) => (
                <Link
                  key={related._id}
                  href={`/events/${related.slug}`}
                  className="block rounded-lg border border-border bg-surface p-4 hover:border-emerald"
                >
                  <p className="font-display text-lg text-text">{related.title}</p>
                  {related.eventDate && (
                    <p className="font-ui text-xs text-text-muted">
                      {related.eventDate}
                    </p>
                  )}
                </Link>
              ))}
            </aside>
          )}
        </div>
      </div>

      <Footer pageFooterCTA={event.pageFooterCTA} />
    </>
  );
}
