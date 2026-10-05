import { defineField, defineType } from "sanity";
import { ARTICLE_CATEGORIES, RECOMMENDED_FOR } from "./constants";
import { RichTextSourceToggle } from "../components/RichTextSourceToggle";

/**
 * article is read by cnf-website's public pages WITHOUT an auth token
 * (sanity/lib/client.ts's public `client`). NEVER create an `article`
 * document with an explicit/custom `_id` (e.g. "article.<slug>") from
 * a script, migration, or raw API/CLI call — Sanity's anonymous
 * "published" perspective silently excludes any document whose `_id`
 * contains a dot, regardless of its `status` field or the dataset's
 * public ACL. This isn't reachable from Studio's own UI (Create/
 * Duplicate always auto-generate a random id) — only from code with
 * API access. Always let Sanity auto-generate the id. Third occurrence
 * of this exact bug (campaign/dossier had it too) — see
 * docs/lessons-learned.md (2026-10-05 entry) and issue #32.
 * `scripts/audit-dotted-ids.mjs` checks for this periodically.
 */
export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls order shown on the Chronicles listing page. Lower numbers appear first; articles without a value sort after any that have one, by published date.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description (SEO)",
      type: "text",
      description:
        "What shows up in Google search results and social share " +
        "previews — different audience/job from Excerpt above (which " +
        "is what a reader sees on the Chronicles listing page). " +
        "Optional — falls back to Excerpt if left blank.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ARTICLE_CATEGORIES.map((c) => ({ title: c, value: c })),
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "recommendedFor",
      title: "Recommended For",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: RECOMMENDED_FOR.map((v) => ({ title: v, value: v })),
      },
      description:
        "Who this article is aimed at — shown as tags on the article " +
        "card. Fine to pick more than one.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }, { type: "calloutBlock" }, { type: "tableBlock" }],
      components: { input: RichTextSourceToggle },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "mediaGalleryItem" }],
      description: "Photos/media shown on the site-wide /gallery page.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
        ],
      },
      initialValue: "published",
    }),
    defineField({
      name: "readTimeMinutes",
      title: "Read Time (minutes)",
      type: "number",
      description: "Auto-calculated hint — override if needed",
    }),
    defineField({
      name: "worlds",
      title: "Worlds",
      type: "array",
      of: [{ type: "reference", to: [{ type: "world" }] }],
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
});
