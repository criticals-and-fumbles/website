import { defineField, defineType } from "sanity";

export default defineType({
  name: "regularEvent",
  title: "Regular Event",
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
      name: "campaignName",
      title: "Campaign Name",
      type: "string",
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: ["Campaign", "One-Shot Series", "Drop-In"].map((v) => ({
          title: v,
          value: v,
        })),
      },
    }),
    defineField({
      name: "frequency",
      title: "Frequency",
      type: "string",
      options: {
        list: ["Weekly", "Biweekly", "Monthly", "Ad-hoc"].map((v) => ({
          title: v,
          value: v,
        })),
      },
    }),
    defineField({
      name: "schedule",
      title: "Schedule",
      type: "string",
      description: 'e.g. "Every Tuesday 7:30pm"',
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "dm",
      title: "DM",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
    }),
    defineField({ name: "system", title: "System", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "playerCount",
      title: "Player Count",
      type: "string",
      description: 'e.g. "4/6 seats filled"',
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: ["Active", "Recruiting", "Full", "Hiatus", "Ended"].map(
          (v) => ({ title: v, value: v }),
        ),
      },
      initialValue: "Active",
    }),
    defineField({
      name: "startedDate",
      title: "Started Date",
      type: "date",
    }),
    defineField({
      name: "sessionCount",
      title: "Session Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
      description: "Optional — if set, shows a Register button instead of View Details",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
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
    select: { title: "title", subtitle: "schedule", media: "coverImage" },
  },
});
