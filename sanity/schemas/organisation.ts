import { defineField, defineType } from "sanity";

export default defineType({
  name: "organisation",
  title: "Organisation",
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
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({ name: "orgType", title: "Org Type", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({ name: "website", title: "Website", type: "url" }),
    defineField({
      name: "yearsPeriod",
      title: "Years / Period",
      type: "string",
      description: 'e.g. "2023 – present"',
    }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "orgType", media: "logo" },
  },
});
