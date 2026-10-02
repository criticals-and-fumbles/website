import { defineField, defineType } from "sanity";

/**
 * campaignStatCategory — additive to the main criticalsandfumbles.com
 * Sanity schema (same project/dataset, see CLAUDE.md). Shared reference
 * data across every campaign, same scoping model as genreTheme ("themes
 * are a shared palette, not a DM's private content") — there is no
 * per-campaign or per-DM ownership here either.
 *
 * Purpose: dossier.statTiles' `label` field stays plain free text (a DM
 * can write anything, same as quickFacts/locationFacts) — but the
 * Campaign Overview page's numeric rollup only totals a stat tile whose
 * label case-insensitively matches one of THESE documents' `name`. This
 * document type exists so that matching list is maintained by editing
 * content in Studio, not by editing code — add, rename, or remove a
 * category here and both the console's statTiles suggestion dropdown
 * and the Campaign Overview rollup logic pick it up on their next fetch,
 * no redeploy needed. DMs don't get Studio access (see CLAUDE.md), so in
 * practice only a Horseman/admin maintains this list — intentional,
 * mirrors genreTheme's "shared palette" model.
 *
 * Seeded 2026-10-01 with 15 categories grouped into World State/Meta-
 * World, Party & Combat, and Economy & Resources — see seed/seed.js.
 * The grouping (`group` field) isn't just organizational: seeing
 * "World State" as its own cluster while picking a stat is part of
 * training DMs to think in world-state/meta-world terms, the whole
 * reason this field exists (see cnf-website's dossier guidance work,
 * 2026-10-01).
 */
export default defineType({
  name: "campaignStatCategory",
  title: "Campaign Stat Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        'Exact text a DM\'s dossier statTile "label" must match (case-insensitive) to be counted in the Campaign Overview rollup. Keep these short and stable — renaming one here means dossiers already using the old text stop matching it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      description:
        "Which cluster this appears under in the console's suggestion dropdown — purely organizational/pedagogical (see file comment), not used by the rollup matching logic itself.",
      options: {
        list: [
          { title: "World State / Meta-World", value: "world-state" },
          { title: "Party & Combat", value: "party-combat" },
          { title: "Economy & Resources", value: "economy" },
        ],
      },
      initialValue: "world-state",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first within their group. Ties fall back to alphabetical.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "group" },
  },
});
