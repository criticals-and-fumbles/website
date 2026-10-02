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
      name: "hero",
      title: "Homepage Hero",
      type: "object",
      description:
        "All copy for the homepage hero (components/celestial/CelestialHero.tsx). heroHeadline/heroEyebrow used to be flat top-level fields on this document (2026-10-02) — restructured into this object the same day, before anything else referenced the flat names, so no migration concerns beyond this document's own data (handled directly via the API, not left as orphaned fields).",
      fields: [
        defineField({
          name: "headline",
          title: "Headline",
          type: "array",
          description:
            'The big headline (e.g. "Every Roll Tells a Story."). Rich text so Bold/Italic are available, but deliberately restricted to those — no headings, lists, or links; this renders inside the page\'s one real <h1>. Rendered inline inside that <h1>, so it inherits the heading\'s own font — nothing here sets a font family of its own. Leave empty to fall back to the component\'s built-in default (which includes a line break and an italic "Story." that a blank rich-text field can\'t express — see that component\'s comment).',
          of: [
            {
              type: "block",
              styles: [{ title: "Normal", value: "normal" }],
              lists: [],
              marks: {
                decorators: [
                  { title: "Bold", value: "strong" },
                  { title: "Italic", value: "em" },
                ],
                annotations: [],
              },
            },
          ],
        }),
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description:
            'The small line above the headline (e.g. "Singapore\'s home for new tabletop RPG players & lifelong game masters"). Leave blank to fall back to the built-in default.',
        }),
        defineField({
          name: "tagline",
          title: "Tagline",
          type: "string",
          description:
            "Short line shown as an <h3>, just after the headline (same font as Eyebrow). Optional — renders nothing at all when blank, unlike Headline/Eyebrow which fall back to built-in copy; there is no default tagline.",
        }),
        defineField({
          name: "homeDescription",
          title: "Home Description",
          type: "text",
          description:
            "Replaces Short Description (below) for the homepage hero's paragraph specifically. Short Description itself is unchanged and still used elsewhere (About page, both footers) — this field exists so the homepage can say something different from those without affecting them. Falls back to Short Description, then to a built-in default, if left blank.",
        }),
      ],
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
                  // "WhatsApp" added 2026-08-19 — additive, same pattern as
                  // Facebook's 2026-08-11 addition above. WhatsApp still
                  // goes through the generic socialLinks array (unlike
                  // Discord's dedicated discordUrl field) since it's just
                  // one more community-invite link, not something with
                  // its own site-wide CTA treatment yet.
                  "WhatsApp",
                  // "Google Reviews" added 2026-09-27 — additive, same
                  // pattern as Facebook/WhatsApp above. Links to the
                  // org's Google Business Profile review share link
                  // (https://g.page/r/...  /review), so members can leave
                  // a review directly; its URL also flows into
                  // OrganizationStructuredData's sameAs (see
                  // components/seo/OrganizationStructuredData.tsx), which
                  // helps Google associate this site with that Business
                  // Profile for Knowledge Panel purposes.
                  "Google Reviews",
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
      name: "legalDisclaimer",
      title: "Legal Disclaimer",
      type: "text",
      description:
        "Fan-content/IP disclaimer shown on the Campaign Logs directory page " +
        "(/campaigns), just above the footer. Blank hides it entirely.",
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
