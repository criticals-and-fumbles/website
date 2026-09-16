import type {
  GalleryMediaResult,
  GallerySourceGroup,
  FlatGalleryItem,
  GalleryPhoto,
} from "@/sanity/lib/types";

// Every filter bucket the gallery page offers — "by parent", not one
// per underlying document type, per the filter-grouping decision this
// feature shipped with (see GallerySourceGroup's doc comment).
export const GALLERY_SOURCE_TYPES: FlatGalleryItem["sourceType"][] = [
  "World",
  "World Unit",
  "Article",
  "Resource",
  "Event",
  "Dossier",
];

function flattenGroup(groups: GallerySourceGroup[]): FlatGalleryItem[] {
  return groups.flatMap((group) =>
    group.items.map((item) => ({
      // Stable across re-fetches — sourceHref + the item's own _key,
      // not an index, so React keys don't shuffle when items reorder.
      key: `${group.sourceHref}#${item._key}`,
      kind: item.kind,
      image: item.image,
      fileUrl: item.fileUrl,
      caption: item.caption,
      credit: item.credit,
      date: item.takenAt ?? group.sourceDate,
      sourceType: group.sourceType,
      sourceTitle: group.sourceTitle,
      sourceHref: group.sourceHref,
    })),
  );
}

/**
 * Flattens GALLERY_MEDIA_QUERY's nested (one-entry-per-source-document)
 * result into one merged, date-sorted list of individual media items —
 * same division of labour as the homepage's RSS-style feed
 * (HOME_RSS_FEED_QUERY / app/(site)/page.tsx), which merges many
 * document types client-side rather than trying to flatten across them
 * in GROQ itself.
 *
 * Also folds in event photos from the pre-existing galleryPhoto flow
 * (GALLERY_PHOTOS_QUERY) into the same shape — that mechanism was
 * deliberately left as-is (see GALLERY_MEDIA_QUERY's comment), so this
 * is where the two sources actually become one list.
 */
export function flattenGalleryMedia(
  result: GalleryMediaResult,
  eventPhotos: GalleryPhoto[],
): FlatGalleryItem[] {
  const fromArrays = [
    ...flattenGroup(result.world),
    ...flattenGroup(result.worldUnit),
    ...flattenGroup(result.keyFigure),
    ...flattenGroup(result.notablePlace),
    ...flattenGroup(result.magicItem),
    ...flattenGroup(result.faction),
    ...flattenGroup(result.loreEntry),
    ...flattenGroup(result.sessionLog),
    ...flattenGroup(result.article),
    ...flattenGroup(result.resource),
    ...flattenGroup(result.regularEvent),
    ...flattenGroup(result.dossier),
  ];

  const fromEventPhotos: FlatGalleryItem[] = eventPhotos.map((photo) => ({
    key: `event-photo-${photo._id}`,
    kind: "image",
    image: photo.image,
    caption: photo.caption,
    credit: photo.photographer,
    date: photo.takenAt,
    sourceType: "Event",
    sourceTitle: photo.event?.title ?? "Event",
    sourceHref: photo.event ? `/events/${photo.event.slug}` : "/events",
  }));

  return [...fromArrays, ...fromEventPhotos].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
}
