/**
 * One-off patch: sets `unitLabel` on all 4 world documents. None of them
 * ever got this field backfilled — `initialValue: "Territory"` in the
 * schema only applies to new documents created in Studio, it doesn't
 * retroactively patch existing ones. Touches only the `unitLabel` field,
 * nothing else. First 3 slugs were patched in an earlier run of this
 * script; titans-gate was added afterward once it turned out to be unset
 * too (contrary to initial assumption).
 *
 * Usage:
 *   npx tsx sanity/migrations/patch-unit-labels.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/patch-unit-labels.ts  # live
 */
process.loadEnvFile(".env.local");

import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const unitLabelPatches: Record<string, string> = {
  "temasek-tales": "District",
  singaporez: "Sector",
  "shattered-tales": "Fragment",
  "titans-gate": "Territory",
};

async function patchUnitLabels(dryRun: boolean) {
  const worlds = await client.fetch<
    { _id: string; name: string; slug: string; unitLabel?: string }[]
  >(
    `*[_type == "world" && slug.current in $slugs] {
      _id, name, "slug": slug.current, unitLabel
    }`,
    { slugs: Object.keys(unitLabelPatches) },
  );

  console.log(`Found ${worlds.length} of ${Object.keys(unitLabelPatches).length} target worlds`);
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  for (const slug of Object.keys(unitLabelPatches)) {
    const world = worlds.find((w) => w.slug === slug);
    const newLabel = unitLabelPatches[slug];

    if (!world) {
      console.log(`[SKIP] "${slug}": no matching world document found`);
      continue;
    }

    console.log(
      `${dryRun ? "[DRY]" : "[PATCH]"} ${world.name} (${slug}): ` +
        `unitLabel "${world.unitLabel ?? "(unset)"}" → "${newLabel}"`,
    );

    if (!dryRun) {
      await client.patch(world._id).set({ unitLabel: newLabel }).commit();
    }
  }

  console.log("--- Done ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
patchUnitLabels(isDryRun);
