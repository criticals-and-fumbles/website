import { defineField, defineType } from "sanity";

const NAMED_TEXT_LIST_FIELD = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          defineField({ name: "name", title: "Name", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text" }),
        ],
      },
    ],
    description,
  });

export default defineType({
  name: "keyFigure",
  title: "Key Figure",
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
        rule
          .required()
          .custom((slug) =>
            !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
              ? true
              : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
          ),
    }),
    defineField({ name: "alsoKnownAs", title: "Also Known As", type: "string" }),
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
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Alive", value: "alive" },
          { title: "Dead", value: "dead" },
          { title: "Unknown", value: "unknown" },
          { title: "Missing", value: "missing" },
        ],
      },
      initialValue: "alive",
    }),
    defineField({
      name: "faction",
      title: "Faction",
      type: "reference",
      to: [{ type: "faction" }],
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Their role in the story — Ruler, Merchant, Villain, Ally, etc.",
    }),
    defineField({
      name: "threatLevel",
      title: "Threat Level",
      type: "string",
      options: {
        list: [
          { title: "Friendly", value: "friendly" },
          { title: "Neutral", value: "neutral" },
          { title: "Cautious", value: "cautious" },
          { title: "Dangerous", value: "dangerous" },
          { title: "Deadly", value: "deadly" },
        ],
      },
      initialValue: "neutral",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Public-facing description — appearance, personality, known history",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
    }),

    // STAT BLOCK — field names map directly to the Fight Club 5e XML
    // compendium format for a future export (not built this session; see
    // CLAUDE.md § Stat block XML mapping).
    defineField({
      name: "hasStatBlock",
      title: "Has Stat Block",
      type: "boolean",
      initialValue: false,
      description: "Enable for combat-relevant NPCs and creatures",
    }),
    defineField({
      name: "statBlock",
      title: "Stat Block",
      type: "object",
      hidden: ({ document }) => !document?.hasStatBlock,
      fields: [
        defineField({
          name: "size",
          title: "Size",
          type: "string",
          options: {
            list: [
              "Tiny",
              "Small",
              "Medium",
              "Large",
              "Huge",
              "Gargantuan",
            ].map((s) => ({ title: s, value: s })),
          },
        }),
        defineField({
          name: "creatureType",
          title: "Creature Type",
          type: "string",
          description: "humanoid, dragon, undead, beast, fiend, etc.",
        }),
        defineField({
          name: "alignment",
          title: "Alignment",
          type: "string",
          description:
            'e.g. "Chaotic Evil" — matches the Fight Club XML <alignment> element',
        }),
        defineField({
          name: "ac",
          title: "Armor Class",
          type: "string",
          description: 'e.g. "15 (studded leather)"',
        }),
        defineField({
          name: "hp",
          title: "Hit Points",
          type: "string",
          description: 'e.g. "58 (9d8+18)"',
        }),
        defineField({
          name: "speed",
          title: "Speed",
          type: "string",
          description: 'e.g. "30 ft., fly 60 ft."',
        }),
        defineField({
          name: "abilities",
          title: "Ability Scores",
          type: "object",
          fields: [
            defineField({ name: "str", title: "STR", type: "number" }),
            defineField({ name: "dex", title: "DEX", type: "number" }),
            defineField({ name: "con", title: "CON", type: "number" }),
            defineField({ name: "int", title: "INT", type: "number" }),
            defineField({ name: "wis", title: "WIS", type: "number" }),
            defineField({ name: "cha", title: "CHA", type: "number" }),
          ],
        }),
        defineField({
          name: "savingThrows",
          title: "Saving Throws",
          type: "string",
          description: 'e.g. "Dex +6, Con +13, Wis +7"',
        }),
        defineField({
          name: "skills",
          title: "Skills",
          type: "string",
          description: 'e.g. "Perception +13, Stealth +6"',
        }),
        defineField({ name: "resistances", title: "Damage Resistances", type: "string" }),
        defineField({ name: "immunities", title: "Damage Immunities", type: "string" }),
        defineField({
          name: "vulnerabilities",
          title: "Damage Vulnerabilities",
          type: "string",
        }),
        defineField({
          name: "conditionImmunities",
          title: "Condition Immunities",
          type: "string",
        }),
        defineField({
          name: "senses",
          title: "Senses",
          type: "string",
          description: 'e.g. "darkvision 60 ft."',
        }),
        defineField({
          name: "passivePerception",
          title: "Passive Perception",
          type: "number",
        }),
        defineField({ name: "languages", title: "Languages", type: "string" }),
        defineField({
          name: "challengeRating",
          title: "Challenge Rating",
          type: "string",
          description: 'Supports fractions — e.g. "1/2", "1/4", "3"',
        }),
        NAMED_TEXT_LIST_FIELD(
          "traits",
          "Traits",
          "Passive abilities — always active",
        ),
        NAMED_TEXT_LIST_FIELD(
          "actions",
          "Actions",
          "Things this creature does on its turn",
        ),
        NAMED_TEXT_LIST_FIELD(
          "legendaryActions",
          "Legendary Actions",
          "Optional — boss-tier creatures only",
        ),
        NAMED_TEXT_LIST_FIELD("reactions", "Reactions", "Optional"),
      ],
    }),

    defineField({
      name: "lastEditedBy",
      title: "Last Edited By",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "Manually set by the editor when they save — not sourced from Sanity's history.",
    }),
    defineField({
      name: "consoleEditedByEmail",
      title: "Console Editor Email (internal)",
      type: "string",
      description:
        "Cloudflare Access email of whoever last saved this via the GM console's " +
        "manual/bulk Wiki builder. Internal audit trail only — never add this " +
        "field to a public-facing GROQ query projection.",
      readOnly: true,
    }),
    defineField({
      name: "consoleEditedAt",
      title: "Console Last Edited At (internal)",
      type: "datetime",
      description: "Timestamp of the last save via the GM console's Wiki builder.",
      readOnly: true,
    }),
    defineField({
      name: "dmNotes",
      title: "DM Notes (private)",
      type: "array",
      of: [{ type: "block" }],
      description:
        "NEVER shown publicly. Encounter hooks, secrets, plot threads. Never queried by public-facing GROQ queries.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "portrait" },
  },
});
