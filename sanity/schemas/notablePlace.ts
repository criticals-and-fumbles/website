import { defineField, defineType } from "sanity";

export default defineType({
  name: "notablePlace",
  title: "Notable Place",
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
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
    }),
    defineField({
      name: "unit",
      title: "World Unit",
      type: "reference",
      to: [{ type: "worldUnit" }],
    }),
    defineField({
      name: "placeType",
      title: "Place Type",
      type: "string",
      description: "Tavern, dungeon, temple, ruin, market, etc.",
    }),
    defineField({
      name: "dangerLevel",
      title: "Danger Level",
      type: "string",
      options: {
        list: [
          { title: "Safe", value: "safe" },
          { title: "Low Risk", value: "low-risk" },
          { title: "Dangerous", value: "dangerous" },
          { title: "Deadly", value: "deadly" },
        ],
      },
      initialValue: "safe",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "images",
      title: "Image Gallery",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "keyFigures",
      title: "Associated Key Figures",
      type: "array",
      of: [{ type: "reference", to: [{ type: "keyFigure" }] }],
    }),
    defineField({
      name: "items",
      title: "Associated Items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "magicItem" }] }],
    }),
    defineField({
      name: "lastEditedBy",
      title: "Last Edited By",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "Manually set by the editor when they save — not sourced from Sanity's history.",
    }),
    defineField({
      name: "dmNotes",
      title: "DM Notes (private)",
      type: "array",
      of: [{ type: "block" }],
      description: "Never shown publicly. Adventure hooks, scenario seeds, secrets.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "placeType" },
  },
});
