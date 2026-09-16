import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { GALLERY_MEDIA_QUERY, GALLERY_PHOTOS_QUERY } from "@/sanity/lib/queries";
import type { GalleryMediaResult, GalleryPhoto, FlatGalleryItem } from "@/sanity/lib/types";
import { flattenGalleryMedia, GALLERY_SOURCE_TYPES, getDossierCampaigns } from "@/lib/gallery";
import { MediaGrid } from "@/components/gallery/MediaGrid";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

// Rebuilt 2026-09-16 from an events-only photo wall into a site-wide
// media gallery — see sanity/schemas/objects/mediaGalleryItem.ts and
// GALLERY_MEDIA_QUERY's doc comment for the full design (embedded
// gallery[] arrays across many source types, merged + sorted + filtered
// client-side, no new document type). Intentionally reachable only from
// the footer's Quick Nav for now, not the main site nav.
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Photos, audio, and video from across Criticals and Fumbles — worlds, articles, resources, dossiers, and community events.",
  path: "/gallery",
});

export default async function GalleryPage({
  searchParams,
}: PageProps<"/gallery">) {
  const { source, campaign } = await searchParams;
  const activeSource = typeof source === "string" ? source : undefined;
  const activeCampaign = typeof campaign === "string" ? campaign : undefined;

  const [galleryMedia, eventPhotos] = await Promise.all([
    client.fetch<GalleryMediaResult>(GALLERY_MEDIA_QUERY),
    client.fetch<GalleryPhoto[]>(GALLERY_PHOTOS_QUERY, { eventId: null }),
  ]);

  const allItems = flattenGalleryMedia(galleryMedia, eventPhotos);
  const bySource = activeSource
    ? allItems.filter((item) => item.sourceType === activeSource)
    : allItems;

  // The campaign sub-filter only makes sense once Dossier is the active
  // source (campaignSlug is only ever set on Dossier items) — ignore it
  // otherwise rather than filtering everything else down to nothing.
  const visible =
    activeSource === "Dossier" && activeCampaign
      ? bySource.filter((item) => item.campaignSlug === activeCampaign)
      : bySource;

  // Only offer a filter button for a source type that actually has at
  // least one item right now — an empty "Dossier" button with nothing
  // behind it is just clutter.
  const availableSourceTypes = GALLERY_SOURCE_TYPES.filter((type) =>
    allItems.some((item) => item.sourceType === type),
  );

  // Distinct campaigns behind the CURRENT source-type filter (i.e. all
  // Dossier items regardless of which one's selected), so the sub-filter
  // row doesn't shuffle out from under the user as they narrow down.
  const availableCampaigns =
    activeSource === "Dossier" ? getDossierCampaigns(bySource) : [];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Gallery</h1>
        <h2 className="sr-only">All Media</h2>
        <p className="mt-2 max-w-prose text-text-muted">
          Photos, audio, and video from across worlds, articles, resources, dossiers, and events.
        </p>

        {availableSourceTypes.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className={`rounded-full border px-4 py-2 font-ui text-xs ${
                !activeSource
                  ? "border-emerald text-emerald"
                  : "border-border text-text-muted hover:border-emerald"
              }`}
            >
              All
            </Link>
            {availableSourceTypes.map((type) => (
              <Link
                key={type}
                href={`/gallery?source=${encodeURIComponent(type)}`}
                className={`rounded-full border px-4 py-2 font-ui text-xs ${
                  activeSource === type
                    ? "border-emerald text-emerald"
                    : "border-border text-text-muted hover:border-emerald"
                }`}
              >
                {type}
              </Link>
            ))}
          </div>
        )}

        {availableCampaigns.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-ui text-xs uppercase tracking-wide text-text-muted">
              Campaign:
            </span>
            <Link
              href="/gallery?source=Dossier"
              className={`rounded-full border px-3 py-1 font-ui text-xs ${
                !activeCampaign
                  ? "border-emerald text-emerald"
                  : "border-border text-text-muted hover:border-emerald"
              }`}
            >
              All
            </Link>
            {availableCampaigns.map(({ slug, title }) => (
              <Link
                key={slug}
                href={`/gallery?source=Dossier&campaign=${encodeURIComponent(slug)}`}
                className={`rounded-full border px-3 py-1 font-ui text-xs ${
                  activeCampaign === slug
                    ? "border-emerald text-emerald"
                    : "border-border text-text-muted hover:border-emerald"
                }`}
              >
                {title}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <MediaGrid items={visible as FlatGalleryItem[]} />
        </div>
      </div>

      <Footer />
    </>
  );
}
