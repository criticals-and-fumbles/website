import { defineField, defineType } from "sanity";

/**
 * Real-world place where events happen (added 2026-10-15). Named `venue`,
 * not `location`, to stay clearly apart from (a) the plain-string
 * `location` field still on regularEvent/majorEvent and (b) the in-fiction
 * `notablePlace` wiki type. Events point here via their `venue` reference;
 * the legacy `location` string stays as a fallback until every event is
 * linked.
 *
 * PRIVACY: the dataset is public-read. A venue marked "private" (e.g. a
 * member's home) is never rendered with its address/map link on the site,
 * but anything typed into the address field is still readable via the
 * Sanity API — so for private venues leave Address blank and share it
 * with confirmed players directly.
 */
export default defineType({
  name: "venue",
  title: "Venue",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({
      name: "visibility",
      title: "Public or Private",
      type: "string",
      options: {
        list: [
          { title: "Public (shop, library, café…)", value: "public" },
          { title: "Private (someone's home / members-only)", value: "private" },
        ],
        layout: "radio",
      },
      initialValue: "public",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 2,
      description:
        "Full street address incl. unit/floor and postal code. For private " +
        "venues leave this BLANK — the dataset is public-read, so anything " +
        "here is retrievable even though the site hides it.",
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
      description: 'Use the "Share → Copy link" URL from Google Maps.',
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "nearestTransit",
      title: "Nearest MRT / Bus",
      type: "string",
      description: 'e.g. "Eunos MRT (EW7), 10 min walk"',
    }),
    defineField({
      name: "directions",
      title: "How to Get There",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Step-by-step: exit to use, landmarks, which entrance, which lift/floor.",
    }),
    defineField({
      name: "accessNotes",
      title: "Access Notes",
      type: "text",
      rows: 2,
      description: "Lift/stairs, wheelchair access, bike parking, opening hours…",
    }),
    defineField({
      name: "privateNote",
      title: "Private Venue Note",
      type: "text",
      rows: 2,
      description:
        'Shown instead of the address when Private, e.g. "Address is shared ' +
        'with confirmed players after registration."',
    }),
    defineField({
      name: "coverImage",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "visibility", media: "coverImage" },
  },
});
