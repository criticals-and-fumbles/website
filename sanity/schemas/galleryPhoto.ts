import { defineField, defineType } from "sanity";

export default defineType({
  name: "galleryPhoto",
  title: "Gallery Photo",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "photographer",
      title: "Photographer",
      type: "string",
    }),
    defineField({
      name: "event",
      title: "Event",
      type: "reference",
      to: [{ type: "majorEvent" }],
    }),
    defineField({ name: "takenAt", title: "Taken At", type: "date" }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "photographer", media: "image" },
  },
});
