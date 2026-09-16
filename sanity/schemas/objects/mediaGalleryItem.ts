import { defineField, defineType } from "sanity";

/**
 * Shared, reusable object type — NOT a document type — for the site-wide
 * "/gallery" feature (2026-09-16). Deliberately an embedded array field
 * (`gallery: array of mediaGalleryItem`) on whichever document types opt
 * in, not a separate document per photo — that would multiply document
 * count with every upload ("document sprawl", the exact thing this
 * design avoids). Contributors upload directly on the document they're
 * already editing (an article, a world, a key figure, ...); the gallery
 * page aggregates every one of these arrays across every opted-in type
 * into one merged, filterable feed at query time — see
 * GALLERY_MEDIA_QUERY in lib/queries.ts, same cross-type-merge technique
 * HOME_RSS_FEED_QUERY already uses.
 *
 * Loosely mirrors campaigns' dossier.media (`mediaItem` in that repo's
 * schema/dossier.js, and this repo's own hand-kept-in-sync
 * sanity/schemas/dossier.ts) — same kind/image/file conditional-field
 * shape — but is NOT the same type and isn't shared with it. dossier
 * documents are authored entirely through the separate campaigns
 * console, never through this Studio, so changing that existing type
 * here wouldn't even affect real data — simpler and safer to keep it
 * fully separate and let the gallery query handle the (minor) shape
 * difference when merging dossier.media in alongside this type.
 *
 * Events keep using the existing galleryPhoto document type (already
 * supports many photos per event via its own `event` reference) —
 * deliberately not migrated to this pattern, since it already works
 * and migrating live data for consistency alone isn't worth the risk.
 */
export default defineType({
  name: "mediaGalleryItem",
  title: "Media Item",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Audio", value: "audio" },
          { title: "Video", value: "video" },
        ],
      },
      initialValue: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
      hidden: ({ parent }) => parent?.kind !== "image",
    }),
    defineField({
      name: "file",
      title: "Audio/Video File",
      type: "file",
      description: "Used when Kind is Audio or Video.",
      hidden: ({ parent }) => parent?.kind === "image" || !parent?.kind,
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "credit",
      title: "Credit",
      type: "string",
      description: "Photographer, narrator, artist — whoever should be credited.",
    }),
    defineField({
      name: "takenAt",
      title: "Taken/Created At",
      type: "date",
      description:
        "Optional — only set this if it differs from when the parent " +
        "document itself was published/created. The gallery falls back " +
        "to the parent's own date when this is left blank.",
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "kind", media: "image" },
  },
});
