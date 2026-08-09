import { defineField, defineType } from "sanity";

export default defineType({
  name: "calloutBlock",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: {
        list: ["info", "warning", "success", "tip"].map((t) => ({
          title: t,
          value: t,
        })),
      },
      initialValue: "info",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "tone" },
  },
});
