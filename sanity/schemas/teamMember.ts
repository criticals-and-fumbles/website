import { defineField, defineType } from "sanity";

const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
  "Unaligned",
];

export default defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "handle",
      title: "Handle",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "handle", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "realName",
      title: "Real Name",
      type: "string",
      description: "Optional — shown smaller, below the handle",
    }),
    defineField({
      name: "role",
      title: "Guild Role",
      type: "string",
      description:
        "Free text guild title, e.g. \"Founder\", \"Event Coordinator\" — no fixed list yet, add one later if the org wants standardised titles.",
    }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      options: {
        list: [
          { title: "Leadership", value: "Leadership" },
          { title: "DM Council", value: "DMCouncil" },
          { title: "Regular Player", value: "RegularPlayer" },
          { title: "Alumni", value: "Alumni" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dndClass",
      title: "D&D Class",
      type: "string",
    }),
    defineField({
      name: "race",
      title: "Race",
      type: "string",
    }),
    defineField({
      name: "alignment",
      title: "Alignment",
      type: "string",
      options: { list: ALIGNMENTS.map((a) => ({ title: a, value: a })) },
      initialValue: "Unaligned",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "object",
      fields: [
        defineField({
          name: "charisma",
          title: "Charisma",
          type: "number",
          validation: (rule) => rule.min(1).max(20),
        }),
        defineField({
          name: "wisdom",
          title: "Wisdom",
          type: "number",
          validation: (rule) => rule.min(1).max(20),
        }),
        defineField({
          name: "intelligence",
          title: "Intelligence",
          type: "number",
          validation: (rule) => rule.min(1).max(20),
        }),
        defineField({
          name: "luck",
          title: "Luck",
          type: "number",
          validation: (rule) => rule.min(1).max(20),
        }),
      ],
    }),
    defineField({
      name: "backstory",
      title: "Backstory",
      type: "text",
    }),
    defineField({
      name: "signatureMove",
      title: "Signature Move",
      type: "string",
    }),
    defineField({
      name: "worlds",
      title: "Worlds",
      type: "array",
      of: [{ type: "reference", to: [{ type: "world" }] }],
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  "Discord",
                  "Twitter",
                  "Twitch",
                  "Instagram",
                  "YouTube",
                ].map((p) => ({ title: p, value: p })),
              },
            }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
        },
      ],
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "handle", subtitle: "role", media: "avatar" },
  },
});
