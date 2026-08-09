import { defineField, defineType } from "sanity";
import { LORE_CATEGORIES, CANON_STATUSES } from "./constants";

export default defineType({
  name: "loreEntry",
  title: "Lore Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alsoKnownAs",
      title: "Also Known As",
      type: "string",
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: LORE_CATEGORIES.map((c) => ({ title: c, value: c })),
      },
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }, { type: "calloutBlock" }],
    }),
    defineField({
      name: "canonStatus",
      title: "Canon Status",
      type: "string",
      options: { list: CANON_STATUSES },
      initialValue: "canon",
    }),
    defineField({
      name: "firstAppeared",
      title: "First Appeared",
      type: "string",
    }),
    defineField({
      name: "relatedEntries",
      title: "Related Entries",
      type: "array",
      of: [{ type: "reference", to: [{ type: "loreEntry" }] }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "lastEditedBy",
      title: "Last Edited By",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "submittedBy",
      title: "Submitted By",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
