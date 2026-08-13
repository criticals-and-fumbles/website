/**
 * One-off seed: creates the 3 C&F division documents (DM & Story Group,
 * Project Wing, Art House). Idempotent — skips any division whose `name`
 * already exists rather than creating a duplicate, so it's safe to re-run.
 * Logos left unset — uploaded manually via Studio afterward, per instruction
 * not to generate/source images here.
 *
 * Usage:
 *   npx tsx sanity/migrations/seed-divisions.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/seed-divisions.ts  # live
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

const DIVISIONS = [
  {
    name: "DM & Story Group",
    blurb:
      "World-building and RPG sessions — the DMs and storytellers who run the games and build the worlds we play in.",
    order: 1,
  },
  {
    name: "Project Wing",
    blurb:
      "Product development — turning ideas into the tools, guides, and resources the community uses.",
    order: 2,
  },
  {
    name: "Art House",
    blurb: "Podcasts and miniature painting — the creative and visual side of the hobby.",
    order: 3,
  },
];

async function seedDivisions(dryRun: boolean) {
  const existing = await client.fetch<{ name: string }[]>(
    `*[_type == "division"]{ name }`,
  );
  const existingNames = new Set(existing.map((d) => d.name));

  console.log(`Found ${existing.length} existing division document(s)`);
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  for (const division of DIVISIONS) {
    if (existingNames.has(division.name)) {
      console.log(`[SKIP] "${division.name}" already exists`);
      continue;
    }

    console.log(
      `${dryRun ? "[DRY]" : "[CREATE]"} division "${division.name}" ` +
        `(order: ${division.order})`,
    );

    if (!dryRun) {
      await client.create({
        _type: "division",
        name: division.name,
        slug: { _type: "slug", current: division.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") },
        blurb: division.blurb,
        order: division.order,
      });
    }
  }

  console.log("--- Done ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
seedDivisions(isDryRun);
