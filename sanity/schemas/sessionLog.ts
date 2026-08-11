import { defineField, defineType } from "sanity";
import { SESSION_TONES } from "./constants";

export default defineType({
  name: "sessionLog",
  title: "Session Log",
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
      name: "sessionNumber",
      title: "Session Number",
      type: "number",
    }),
    defineField({
      name: "campaignName",
      title: "Campaign Name",
      type: "string",
    }),
    defineField({
      name: "sessionDate",
      title: "Session Date",
      type: "date",
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      title: "World Unit",
      type: "reference",
      to: [{ type: "worldUnit" }],
      description:
        "Optional — scope this entry to a specific unit/territory within the world. Leave blank for world-level entries not tied to a single unit.",
    }),
    defineField({
      name: "dm",
      title: "DM",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "players",
      title: "Players",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),
    defineField({
      name: "sessionTitle",
      title: "Session Title",
      type: "string",
      description: "In-fiction episode title, distinct from the doc title",
    }),
    defineField({ name: "synopsis", title: "Synopsis", type: "text" }),
    defineField({
      name: "fullRecap",
      title: "Full Recap",
      type: "array",
      of: [{ type: "block" }, { type: "calloutBlock" }],
    }),
    defineField({
      name: "notableMoments",
      title: "Notable Moments",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "loreUpdates",
      title: "Lore Updates",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "npcStatusChanges",
      title: "NPC Status Changes",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "nextSession",
      title: "Next Session",
      type: "string",
    }),
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: SESSION_TONES.map((t) => ({ title: t, value: t })),
      },
    }),
    defineField({
      name: "regularEvent",
      title: "Regular Event",
      type: "reference",
      to: [{ type: "regularEvent" }],
      description: "Optional — link back to the recurring campaign schedule",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "sessionNumber" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle ? `Session ${subtitle}` : undefined,
    }),
  },
});
