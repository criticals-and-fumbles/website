import { defineField, defineType } from "sanity";

export default defineType({
  name: "division",
  title: "Division",
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
      options: { source: "name" },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "blurb",
      title: "Short Blurb",
      type: "text",
      description: "A short description of what this division does",
    }),
    defineField({
      name: "colourAccent",
      title: "Colour Accent",
      type: "string",
      description: "Hex colour for this division's badges, e.g. #2EC56B",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls order shown on About page",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "blurb", media: "logo" },
  },
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
});
