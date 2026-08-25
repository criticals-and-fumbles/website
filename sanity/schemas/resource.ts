import { defineField, defineType } from "sanity";

export default defineType({
  name: "resource",
  title: "Resource",
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
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "PDF", value: "pdf" },
          { title: "Digital Product", value: "digital" },
          { title: "Book", value: "book" },
          { title: "Link", value: "link" },
          { title: "Tool", value: "tool" },
          { title: "Guide", value: "guide" },
        ],
      },
    }),
    defineField({
      name: "division",
      title: "Division",
      type: "string",
      options: {
        list: [
          { title: "DM & Story Group", value: "dm-story" },
          { title: "Project Wing", value: "project-wing" },
          { title: "Art House", value: "art-house" },
          { title: "General", value: "general" },
        ],
      },
      initialValue: "general",
    }),
    defineField({
      name: "downloadUrl",
      title: "Download URL",
      type: "url",
      description: "Gumroad or direct file URL",
    }),
    defineField({ name: "thumbnail", title: "Thumbnail", type: "image" }),
    defineField({
      name: "fileSize",
      title: "File Size",
      type: "string",
    }),
    defineField({
      name: "accessLevel",
      title: "Access Level",
      type: "string",
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Members", value: "members" },
          { title: "Paid", value: "paid" },
        ],
      },
      initialValue: "free",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
