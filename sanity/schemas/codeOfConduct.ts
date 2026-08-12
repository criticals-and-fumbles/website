import { defineField, defineType } from "sanity";

export default defineType({
  name: "codeOfConduct",
  title: "Code of Conduct",
  type: "document",
  fields: [
    defineField({
      name: "introTagline",
      title: "Intro Tagline",
      type: "string",
      description: "Short line introducing this section",
    }),
    defineField({
      name: "tableExpectations",
      title: "Table Expectations",
      type: "array",
      of: [
        {
          type: "object",
          name: "expectation",
          fields: [
            defineField({ name: "number", title: "Number", type: "number" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "points",
              title: "Points",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: { select: { title: "title", subtitle: "number" } },
        },
      ],
    }),
    defineField({
      name: "safetyComfort",
      title: "Safety & Comfort",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "introText", title: "Intro Text", type: "text" }),
        defineField({
          name: "tools",
          title: "Safety Tools",
          type: "array",
          of: [{ type: "string" }],
          description:
            "e.g. Pause, Time-out, Break, Fade-to-Black, Redirection, Retcon, Step Out",
        }),
        defineField({
          name: "points",
          title: "Additional Points",
          type: "array",
          of: [{ type: "string" }],
        }),
      ],
    }),
    defineField({
      name: "diceRules",
      title: "Dice & Rules",
      type: "array",
      of: [
        {
          type: "object",
          name: "rule",
          fields: [
            defineField({ name: "number", title: "Number", type: "number" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "points",
              title: "Points",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: { select: { title: "title", subtitle: "number" } },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Code of Conduct" }),
  },
});
