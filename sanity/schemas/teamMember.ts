import { defineField, defineType } from "sanity";
import { TEAM_MEMBER_ROLES } from "./constants";

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
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({
      name: "realName",
      title: "Real Name",
      type: "string",
      description: "Optional — shown smaller, below the handle",
    }),
    defineField({
      name: "roles",
      title: "Roles",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: TEAM_MEMBER_ROLES,
        layout: "grid",
      },
    }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      options: {
        list: [
          { title: "Horsemen", value: "Horsemen" },
          { title: "DM Council", value: "DMCouncil" },
          { title: "Uncle's League", value: "UnclesLeague" },
          { title: "Critical Fumblers", value: "CriticalFumblers" },
        ],
      },
      initialValue: "UnclesLeague",
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
      name: "division",
      title: "Division",
      type: "reference",
      to: [{ type: "division" }],
      description: "Which C&F division this member primarily belongs to",
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
      name: "ownerEmailHash",
      title: "Owner Email Hash",
      type: "string",
      description:
        "HMAC-SHA256 of this member's Cloudflare Access login email, keyed by a secret that lives only as a Worker secret (never in any repo or this dataset). Links this document to whoever authenticates with that email in the campaigns console's self-service editing — never store the plain email here, this dataset is publicly readable with no auth. Set via a one-off admin script (see campaigns repo's scripts/link-team-member.js), not typed by hand.",
      readOnly: true,
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: {
      title: "handle",
      realName: "realName",
      role: "roles.0",
      media: "avatar",
    },
    prepare({ title, realName, role, media }) {
      return {
        title,
        subtitle: realName ?? role,
        media,
      };
    },
  },
});
