import { defineField, defineType } from "sanity";

/**
 * Singleton, same pattern as philosophy.ts/codeOfConduct.ts — one
 * document, rendered on the About page's "Divisions" tab right below
 * DivisionsGrid. Added 2026-09-02: a short "how the three divisions work
 * together" summary, written to naturally cover target search phrases
 * (Singapore D&D, homebrew D&D, Temasek Tales, Zombicide RPG, Infinity
 * RPG, Singapore alternate history, Singapore dungeon masters, Singapore
 * role playing games, Singapore gaming community, etc.) that don't
 * belong on any single division's own short blurb without reading as
 * keyword-stuffed. See docs/design-system.md or the About page itself
 * for where this renders.
 */
export default defineType({
  name: "divisionsSynergy",
  title: "Divisions Synergy",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "How It All Comes Together",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      description:
        "A short paragraph (2-4 sentences) on how the three divisions combine. Plain text, no rich formatting needed for a section this short.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Divisions Synergy" }),
  },
});
