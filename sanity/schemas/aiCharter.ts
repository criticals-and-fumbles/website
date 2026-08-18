import { defineField, defineType } from "sanity";

export default defineType({
  name: "aiCharter",
  title: "AI Charter",
  type: "document",
  fields: [
    defineField({
      name: "intro",
      title: "Intro",
      type: "array",
      of: [{ type: "block" }],
      description: "Opening framing text before the numbered principles",
    }),
    defineField({
      name: "principles",
      title: "Principles",
      type: "array",
      of: [
        {
          type: "object",
          name: "principle",
          fields: [
            defineField({ name: "number", title: "Number", type: "number" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "body",
              title: "Body",
              type: "array",
              of: [{ type: "block" }],
              description:
                "Full principle text, supports multiple paragraphs and the short italic/bold summary lines used throughout this content",
            }),
            defineField({
              name: "pullQuote",
              title: "Pull Quote",
              type: "string",
              description:
                'The short standalone line for this principle, e.g. "AI can suggest. People still decide." — rendered with visual emphasis',
            }),
          ],
          preview: { select: { title: "title", subtitle: "pullQuote" } },
        },
      ],
    }),
    defineField({
      name: "closingStatement",
      title: "Closing Statement",
      type: "array",
      of: [{ type: "block" }],
      description:
        'Final section — "This is who we are trying to be" and the tagline callback',
    }),
  ],
  preview: {
    prepare() {
      return { title: "AI Charter" };
    },
  },
});
