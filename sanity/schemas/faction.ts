import { defineField, defineType } from "sanity";

export default defineType({
  name: "faction",
  title: "Faction",
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
        rule
          .required()
          .custom((slug) =>
            !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
              ? true
              : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
          ),
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
    }),
    defineField({
      name: "unit",
      title: "World Unit",
      type: "reference",
      to: [{ type: "worldUnit" }],
    }),
    defineField({
      name: "factionType",
      title: "Type",
      type: "string",
      description: "Guild, cult, noble house, criminal organisation, etc.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "banner", title: "Banner/Logo", type: "image" }),
    defineField({
      name: "members",
      title: "Known Members",
      type: "array",
      of: [{ type: "reference", to: [{ type: "keyFigure" }] }],
    }),
    defineField({
      name: "lastEditedBy",
      title: "Last Edited By",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "Manually set by the editor when they save — not sourced from Sanity's history.",
    }),
    defineField({
      name: "consoleEditedByEmail",
      title: "Console Editor Email (internal)",
      type: "string",
      description:
        "Cloudflare Access email of whoever last saved this via the GM console's " +
        "manual/bulk Wiki builder. Internal audit trail only — never add this " +
        "field to a public-facing GROQ query projection.",
      readOnly: true,
    }),
    defineField({
      name: "consoleEditedAt",
      title: "Console Last Edited At (internal)",
      type: "datetime",
      description: "Timestamp of the last save via the GM console's Wiki builder.",
      readOnly: true,
    }),
    defineField({
      name: "dmNotes",
      title: "DM Notes (private)",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "factionType", media: "banner" },
  },
});
