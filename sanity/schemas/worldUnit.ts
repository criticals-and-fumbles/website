import { defineField, defineType } from "sanity";

export default defineType({
  name: "worldUnit",
  title: "World Unit",
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
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dmOwner",
      title: "DM Owner",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "The DM who owns and develops this unit",
    }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "array",
      of: [{ type: "block" }],
      description:
        "General description of this unit — geography, atmosphere, first impressions",
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
      description:
        "Small maps only — under 500KB. For larger maps use mapImageUrl instead.",
    }),
    defineField({
      name: "mapImageUrl",
      title: "Map Image URL (R2)",
      type: "url",
      description:
        "Use for large/high-res maps hosted on Cloudflare R2 instead of Sanity",
    }),
    defineField({
      name: "developmentStatus",
      title: "Development Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "In Progress", value: "in-progress" },
          { title: "Established", value: "established" },
          { title: "Canonical", value: "canonical" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "colourAccent",
      title: "Colour Accent",
      type: "string",
      description: "Hex colour for this unit's badges and borders, e.g. #8B2FC9",
      validation: (rule) =>
        rule.regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
          name: "hex colour",
        }),
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "world.name", media: "coverImage" },
  },
});
