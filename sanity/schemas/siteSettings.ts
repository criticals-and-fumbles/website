import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
    }),
    defineField({
      name: "foundedYear",
      title: "Founded Year",
      type: "number",
    }),
    defineField({ name: "basedIn", title: "Based In", type: "string" }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),
    defineField({ name: "discordUrl", title: "Discord URL", type: "url" }),
    defineField({
      name: "discordServerName",
      title: "Discord Server Name",
      type: "string",
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
                // "Facebook" added 2026-08-11 (Phase 1.4) — additive only,
                // per the schema-safety rules for this session: existing
                // values untouched, nothing renamed/removed. Discord isn't
                // added here — it already has its own dedicated
                // discordUrl/discordServerName fields on this document.
                list: [
                  "Twitter",
                  "Instagram",
                  "YouTube",
                  "Twitch",
                  "TikTok",
                  "Facebook",
                ].map((p) => ({ title: p, value: p })),
              },
            }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
        },
      ],
    }),
    defineField({
      name: "newsletterName",
      title: "Newsletter Name",
      type: "string",
    }),
    defineField({
      name: "newsletterDescription",
      title: "Newsletter Description",
      type: "text",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image" }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "footerNavLinks",
      title: "Footer Nav Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "copyrightLine",
      title: "Copyright Line",
      type: "string",
    }),
    defineField({
      name: "activities",
      title: "Activities",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "visionStatement",
      title: "Vision Statement",
      type: "text",
    }),
    defineField({
      name: "missionStatement",
      title: "Mission Statement",
      type: "text",
    }),
    defineField({
      name: "historyTimeline",
      title: "History Timeline",
      type: "array",
      of: [
        {
          type: "object",
          name: "historyEntry",
          fields: [
            defineField({ name: "year", title: "Year", type: "number" }),
            defineField({
              name: "displayTitle",
              title: "Title",
              type: "string",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
            }),
            defineField({ name: "tag", title: "Tag", type: "string" }),
          ],
          preview: {
            select: { title: "displayTitle", subtitle: "year" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
