import { defineField, defineType } from "sanity";

export default defineType({
  name: "majorEvent",
  title: "Major Event",
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
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: [
          "Convention",
          "Tournament",
          "Workshop",
          "One-Shot Night",
          "Social",
          "Charity",
          "Community",
        ].map((v) => ({ title: v, value: v })),
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Watch This Space", value: "watch-this-space" },
          { title: "Coming Soon", value: "coming-soon" },
          { title: "Registration Open", value: "registration-open" },
          { title: "Full", value: "full" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "watch-this-space",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventDate",
      title: "Event Date (display)",
      type: "string",
      description: 'Flexible display string, e.g. "Q3 2027"',
    }),
    defineField({
      name: "startDate",
      title: "Start Date (for countdown)",
      type: "datetime",
      description: "Optional — only needed if you want a live countdown",
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "capacity", title: "Capacity", type: "number" }),
    defineField({
      name: "ticketPrice",
      title: "Ticket Price",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "watchThisSpaceTeaser",
      title: "Watch This Space Teaser",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "schedule",
      title: "Schedule / Programme",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "dms",
      title: "DM(s)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "splashImage",
      title: "Splash Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "coverImage" },
  },
});
