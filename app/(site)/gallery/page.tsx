import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { GALLERY_EVENTS_QUERY, GALLERY_PHOTOS_QUERY } from "@/sanity/lib/queries";
import type { GalleryPhoto } from "@/sanity/lib/types";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Photos from D&D marathons, painting workshops, learn-to-play days, and community events with Criticals and Fumbles in Singapore.",
  path: "/gallery",
});

interface GalleryEvent {
  _id: string;
  title: string;
  slug: string;
}

export default async function GalleryPage({
  searchParams,
}: PageProps<"/gallery">) {
  const { event } = await searchParams;
  const activeEventId = typeof event === "string" ? event : undefined;

  const [photos, events] = await Promise.all([
    client.fetch<GalleryPhoto[]>(GALLERY_PHOTOS_QUERY, {
      eventId: activeEventId ?? null,
    }),
    client.fetch<GalleryEvent[]>(GALLERY_EVENTS_QUERY),
  ]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Gallery</h1>

        {events.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className={`rounded-full border px-4 py-2 font-ui text-xs ${
                !activeEventId
                  ? "border-emerald text-emerald"
                  : "border-border text-text-muted hover:border-emerald"
              }`}
            >
              All Events
            </Link>
            {events.map((ev) => (
              <Link
                key={ev._id}
                id={ev.slug}
                href={`/gallery?event=${ev._id}`}
                className={`rounded-full border px-4 py-2 font-ui text-xs ${
                  activeEventId === ev._id
                    ? "border-emerald text-emerald"
                    : "border-border text-text-muted hover:border-emerald"
                }`}
              >
                {ev.title}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <PhotoGrid photos={photos} />
        </div>
      </div>

      <Footer />
    </>
  );
}
