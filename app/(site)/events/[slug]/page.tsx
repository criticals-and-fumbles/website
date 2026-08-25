import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  GALLERY_PHOTOS_QUERY,
  MAJOR_EVENT_BY_SLUG_QUERY,
  MAJOR_EVENTS_UPCOMING_QUERY,
  REGULAR_EVENT_BY_SLUG_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type {
  MajorEvent,
  MajorEventCardData,
  RegularEvent,
  SiteSettings,
} from "@/sanity/lib/types";
import { buildMetadata, plainTextFromBlocks } from "@/lib/metadata";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/events/CountdownTimer";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import { EventStructuredData } from "@/components/seo/EventStructuredData";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await client.fetch<MajorEvent | null>(MAJOR_EVENT_BY_SLUG_QUERY, {
    slug,
  });

  if (event) {
    const descriptionText = plainTextFromBlocks(event.description);

    return buildMetadata({
      title: event.title,
      description:
        event.tagline ??
        descriptionText ??
        `Join Criticals and Fumbles for ${event.title} in Singapore.`,
      path: `/events/${slug}`,
      image: urlForImage(event.splashImage ?? event.coverImage)
        ?.width(1200)
        .height(630)
        .url(),
      type: "event",
    });
  }

  const regularEvent = await client.fetch<RegularEvent | null>(
    REGULAR_EVENT_BY_SLUG_QUERY,
    { slug },
  );
  if (!regularEvent) return {};

  const regularDescriptionText = plainTextFromBlocks(regularEvent.description);

  return buildMetadata({
    title: regularEvent.campaignName ?? regularEvent.title,
    description:
      regularDescriptionText ??
      `Join Criticals and Fumbles for ${regularEvent.campaignName ?? regularEvent.title} in Singapore.`,
    path: `/events/${slug}`,
    image: urlForImage(regularEvent.coverImage)?.width(1200).height(630).url(),
    type: "event",
  });
}

const STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function EventDetailPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await client.fetch<MajorEvent | null>(MAJOR_EVENT_BY_SLUG_QUERY, {
    slug,
  });

  if (event) return <MajorEventDetail event={event} />;

  const regularEvent = await client.fetch<RegularEvent | null>(
    REGULAR_EVENT_BY_SLUG_QUERY,
    { slug },
  );

  if (!regularEvent) notFound();

  return <RegularEventDetail event={regularEvent} />;
}

async function MajorEventDetail({ event }: { event: MajorEvent }) {
  const [photos, related, siteSettings] = await Promise.all([
    client.fetch<{ _id: string }[]>(GALLERY_PHOTOS_QUERY, {
      eventId: event._id,
    }),
    client.fetch<MajorEventCardData[]>(MAJOR_EVENTS_UPCOMING_QUERY),
    client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
  ]);

  const splashUrl = urlForImage(event.splashImage ?? event.coverImage)
    ?.width(1600)
    .height(700)
    .auto("format")
    .url();

  const relatedEvents = related.filter((e) => e._id !== event._id).slice(0, 3);

  return (
    <>
      <EventStructuredData event={event} />

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
            <h2 className="sr-only">Event Details</h2>
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

            {event.registrationUrl ? (
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <LinkButton href={event.registrationUrl} external variant="primary">
                  Register →
                </LinkButton>
                {siteSettings?.discordUrl && (
                  <a
                    href={siteSettings.discordUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-ui text-sm text-emerald hover:underline"
                  >
                    Questions? Ask us on Discord →
                  </a>
                )}
              </div>
            ) : (
              siteSettings?.discordUrl && (
                <div className="mt-10">
                  <LinkButton href={siteSettings.discordUrl} external variant="primary">
                    Questions? Ask us on Discord →
                  </LinkButton>
                </div>
              )
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

/**
 * regularEvent detail render — deliberately simpler than MajorEventDetail:
 * no countdown/gallery/related-events sections, since regularEvent has
 * none of those concepts and only one regularEvent document exists at all
 * right now so "related" wouldn't be meaningful yet. Does show a Register
 * button when registrationUrl is set (added 2026-08-14), same
 * Register-or-nothing-plus-Discord pattern as MajorEventDetail.
 */
async function RegularEventDetail({ event }: { event: RegularEvent }) {
  const siteSettings = await client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
  const imageUrl = urlForImage(event.coverImage)
    ?.width(1600)
    .height(700)
    .auto("format")
    .url();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {imageUrl && (
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={event.campaignName ?? event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-8">
          <Badge variant="emerald">{event.status ?? "Regular Session"}</Badge>
          <h1 className="mt-3 font-display text-5xl text-text">
            {event.campaignName ?? event.title}
          </h1>
          <h2 className="sr-only">Event Details</h2>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6 font-ui text-xs sm:grid-cols-4">
            {event.schedule && (
              <div>
                <dt className="text-text-muted">Schedule</dt>
                <dd className="mt-1 text-text">{event.schedule}</dd>
              </div>
            )}
            {event.location && (
              <div>
                <dt className="text-text-muted">Location</dt>
                <dd className="mt-1 text-text">{event.location}</dd>
              </div>
            )}
            {event.system && (
              <div>
                <dt className="text-text-muted">System</dt>
                <dd className="mt-1 text-text">{event.system}</dd>
              </div>
            )}
            {event.playerCount && (
              <div>
                <dt className="text-text-muted">Players</dt>
                <dd className="mt-1 text-text">{event.playerCount}</dd>
              </div>
            )}
          </dl>

          {event.description && <Renderer value={event.description} />}

          {event.dm && (
            <div className="mt-10">
              <h2 className="font-display text-2xl text-text">Dungeon Master</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/team/${event.dm.slug}`}
                  className="rounded-full border border-border px-4 py-2 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                >
                  {event.dm.handle}
                </Link>
              </div>
            </div>
          )}

          {event.world && (
            <div className="mt-10">
              <h2 className="font-display text-2xl text-text">World</h2>
              <Link
                href={`/wiki/${event.world.slug}`}
                className="mt-3 inline-block rounded-full border border-border px-4 py-2 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
              >
                {event.world.name}
              </Link>
            </div>
          )}

          {event.registrationUrl ? (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <LinkButton href={event.registrationUrl} external variant="primary">
                Register →
              </LinkButton>
              {siteSettings?.discordUrl && (
                <a
                  href={siteSettings.discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-ui text-sm text-emerald hover:underline"
                >
                  Questions? Ask us on Discord →
                </a>
              )}
            </div>
          ) : (
            siteSettings?.discordUrl && (
              <div className="mt-10">
                <LinkButton href={siteSettings.discordUrl} external variant="primary">
                  Questions? Ask us on Discord →
                </LinkButton>
              </div>
            )
          )}
        </div>
      </div>

      <Footer pageFooterCTA={event.pageFooterCTA} />
    </>
  );
}
