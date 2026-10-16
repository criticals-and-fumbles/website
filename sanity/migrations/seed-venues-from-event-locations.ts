/**
 * Creates `venue` documents for the two real venues currently typed as free
 * text in regularEvent.location, and sets regularEvent.venue on matching
 * events. ADDITIVE ONLY: the legacy `location` string is left untouched
 * (it stays as the page's fallback), and events already holding a `venue`
 * are skipped. Google Maps URLs / directions / access notes are NOT
 * invented here — fill them in Studio afterwards.
 *
 * Venue docs get Sanity auto-generated ids on purpose (never a custom
 * dotted id — see docs/lessons-learned.md, issue #32).
 *
 * Usage:
 *   npx tsx sanity/migrations/seed-venues-from-event-locations.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/seed-venues-from-event-locations.ts  # live
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

const VENUES = [
  {
    name: "Xpidemix",
    slug: "xpidemix",
    address: "473A Joo Chiat Rd, #2nd Floor\nSingapore 427681",
    // Matches "Xpidemix" and "Xpidemix - 473A Joo Chiat Rd, ..." variants.
    match: (loc: string) => /^xpidemix\b/i.test(loc.trim()),
  },
  {
    name: "Serangoon NEX National Library",
    slug: "serangoon-nex-national-library",
    address: undefined,
    match: (loc: string) => /serangoon nex/i.test(loc),
  },
];

async function run(dryRun: boolean) {
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN ---");
  const events = await client.fetch<
    { _id: string; title: string; location?: string; venue?: { _ref: string } }[]
  >(`*[_type == "regularEvent" && !(_id in path("drafts.**"))]{ _id, title, location, venue }`);

  for (const v of VENUES) {
    const matches = events.filter((e) => e.location && v.match(e.location) && !e.venue);
    let venueId = await client.fetch<string | null>(
      `*[_type == "venue" && slug.current == $slug][0]._id`,
      { slug: v.slug },
    );
    console.log(`\n${v.name}: ${venueId ? `venue exists (${venueId})` : "venue will be created"}; ${matches.length} event(s) to link`);
    for (const e of matches) console.log(`  - ${e.title} (location: ${JSON.stringify(e.location)})`);
    if (dryRun) continue;

    if (!venueId) {
      const created = await client.create({
        _type: "venue",
        name: v.name,
        slug: { _type: "slug", current: v.slug },
        visibility: "public",
        ...(v.address ? { address: v.address } : {}),
      });
      venueId = created._id;
    }
    for (const e of matches) {
      await client.patch(e._id).set({ venue: { _type: "reference", _ref: venueId } }).commit();
    }
  }
  console.log("\n--- Done ---");
}

run(process.env.DRY_RUN !== "false").catch((e) => {
  console.error(e);
  process.exit(1);
});
