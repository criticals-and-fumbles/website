/**
 * One-off patch: derives `sections` (the new Wikipedia/Fandom-style
 * structured lore field) from each world's existing flat `description`
 * Portable Text array, splitting at every h1-styled block — each h1's
 * text becomes a section heading, everything after it (up to the next
 * h1) becomes that section's body. Any blocks before the first h1
 * become a leading "Overview" section, so nothing is dropped even if a
 * world's description doesn't start with a heading.
 *
 * SAFETY: only ever .set()s the new `sections` field. `description`
 * itself is never modified, patched, or unset — it stays exactly as-is,
 * both as a historical record and as the page's fallback render path
 * for as long as any world hasn't been migrated (or if this migration
 * ever needs to be redone). Confirmed via a live query first (see
 * inline dry-run output) — same "verify before touching" discipline as
 * every other migration in this repo.
 *
 * Usage:
 *   npx tsx sanity/migrations/split-world-description-into-sections.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/split-world-description-into-sections.ts  # live
 */
process.loadEnvFile(".env.local");

import { createClient } from "next-sanity";
import { randomUUID } from "node:crypto";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Block = { _key: string; _type: string; style?: string; children?: { text?: string }[] };
type WorldDoc = { _id: string; name: string; slug: string; description?: Block[]; sections?: unknown };

function blockText(block: Block): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

function splitIntoSections(description: Block[]): { heading: string; body: Block[] }[] {
  const sections: { heading: string; body: Block[] }[] = [];
  let current: { heading: string; body: Block[] } | null = null;

  for (const block of description) {
    if (block.style === "h1") {
      if (current) sections.push(current);
      current = { heading: blockText(block) || "Untitled Section", body: [] };
    } else if (current) {
      current.body.push(block);
    } else {
      // Content before the first h1 — don't drop it.
      if (!sections.find((s) => s.heading === "Overview")) {
        sections.unshift({ heading: "Overview", body: [] });
      }
      sections[0].body.push(block);
    }
  }
  if (current) sections.push(current);

  return sections;
}

async function run(dryRun: boolean) {
  const worlds = await client.fetch<WorldDoc[]>(
    `*[_type == "world" && defined(description)] {
      _id, name, "slug": slug.current, description, sections
    }`,
  );

  console.log(`Found ${worlds.length} worlds with a description`);
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  for (const world of worlds) {
    if (world.sections) {
      console.log(`[SKIP] ${world.name} (${world.slug}): sections already set — not overwriting`);
      continue;
    }

    const split = splitIntoSections(world.description ?? []);
    console.log(
      `${dryRun ? "[DRY]" : "[PATCH]"} ${world.name} (${world.slug}): ` +
        `${world.description?.length ?? 0} blocks -> ${split.length} sections ` +
        `[${split.map((s) => `"${s.heading}" (${s.body.length} blocks)`).join(", ")}]`,
    );

    if (!dryRun) {
      const sections = split.map((s) => ({
        _key: randomUUID().slice(0, 12),
        _type: "worldSection",
        heading: s.heading,
        body: s.body,
      }));
      await client.patch(world._id).set({ sections }).commit();
    }
  }

  console.log("--- Done — description field untouched on every document above ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
run(isDryRun);
