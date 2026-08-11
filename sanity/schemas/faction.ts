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
