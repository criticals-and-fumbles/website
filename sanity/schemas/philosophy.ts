import { defineField, defineType } from "sanity";

export default defineType({
  name: "philosophy",
  title: "Philosophy",
  type: "document",
  fields: [
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "pillars",
      title: "Pillars (Values — Tier 1)",
      type: "array",
      of: [
        {
          type: "object",
          name: "pillar",
          fields: [
            defineField({
              name: "romanNumeral",
              title: "Roman Numeral",
              type: "string",
            }),
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "tagline", title: "Tagline", type: "string" }),
            defineField({
              name: "values",
              title: "Values",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "romanNumeral" },
          },
        },
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "behaviours",
      title: "Behaviours (Feelings — Tier 2)",
      type: "array",
      of: [
        {
          type: "object",
          name: "behaviour",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
            }),
            defineField({
              name: "flavourLine",
              title: "Flavour Line",
              type: "string",
            }),
          ],
          preview: { select: { title: "name", subtitle: "title" } },
        },
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "outcomes",
      title: "Outcomes (Tier 3)",
      type: "array",
      of: [
        {
          type: "object",
          name: "outcome",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
            }),
            defineField({
              name: "flavourLine",
              title: "Flavour Line",
              type: "string",
            }),
          ],
          preview: { select: { title: "name", subtitle: "title" } },
        },
      ],
      validation: (rule) => rule.max(3),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Philosophy" }),
  },
});
