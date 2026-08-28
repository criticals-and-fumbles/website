import { defineField, defineType } from "sanity";

export default defineType({
  name: "magicItem",
  title: "Magic Item",
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
      name: "rarity",
      title: "Rarity",
      type: "string",
      options: {
        list: [
          { title: "Common", value: "common" },
          { title: "Uncommon", value: "uncommon" },
          { title: "Rare", value: "rare" },
          { title: "Very Rare", value: "very-rare" },
          { title: "Legendary", value: "legendary" },
          { title: "Artifact", value: "artifact" },
        ],
      },
      initialValue: "common",
    }),
    defineField({
      name: "itemType",
      title: "Item Type",
      type: "string",
      description: "Weapon, armour, ring, wondrous item, etc.",
    }),
    defineField({
      name: "currentHolder",
      title: "Current Holder",
      type: "reference",
      to: [{ type: "keyFigure" }],
    }),
    defineField({
      name: "foundAt",
      title: "Found At",
      type: "reference",
      to: [{ type: "notablePlace" }],
    }),
    defineField({
      name: "lore",
      title: "Lore",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "itemArt", title: "Item Art", type: "image" }),

    defineField({
      name: "hasMechanics",
      title: "Has Mechanical Stats",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "mechanics",
      title: "Mechanics",
      type: "object",
      hidden: ({ document }) => !document?.hasMechanics,
      fields: [
        defineField({
          name: "itemTypeDetail",
          title: "Type",
          type: "string",
          description: 'e.g. "Weapon (longsword)"',
        }),
        defineField({
          name: "attunement",
          title: "Requires Attunement",
          type: "string",
        }),
        defineField({
          name: "text",
          title: "Effect Text",
          type: "text",
          description: "Full mechanical description matching 5e item text format",
        }),
      ],
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
    select: { title: "name", subtitle: "rarity", media: "itemArt" },
  },
});
