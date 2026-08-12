import { defineField, defineType } from "sanity";

export default defineType({
  name: "world",
  title: "World",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Hiatus", value: "hiatus" },
          { title: "Concluded", value: "concluded" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "dms",
      title: "DM(s)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),
    defineField({
      name: "system",
      title: "System",
      type: "string",
      description: "e.g. D&D 5e, Pathfinder 2e, Homebrew",
    }),
    defineField({
      name: "colourAccent",
      title: "Colour Accent",
      type: "string",
      description: "Hex colour, e.g. #8B2FC9",
      validation: (rule) =>
        rule.regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
          name: "hex colour",
        }),
    }),
    defineField({
      name: "unitLabel",
      title: "Unit Label",
      description:
        "What this world calls its subdivisions (e.g. Territory, District, Sector, Fragment)",
      type: "string",
      initialValue: "Territory",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "activeCategories",
      title: "Active Lore Categories",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "sessionCount",
      title: "Session Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "loreCount",
      title: "Lore Count",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline", media: "coverImage" },
  },
});
