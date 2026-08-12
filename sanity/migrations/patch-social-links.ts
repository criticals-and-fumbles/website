/**
 * One-off patch: appends a Facebook entry to siteSettings.socialLinks.
 * Existing entries (Instagram, and one stray empty entry) are left exactly
 * as-is — this only appends, never replaces the array wholesale.
 *
 * Usage:
 *   npx tsx sanity/migrations/patch-social-links.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/patch-social-links.ts  # live
 */
process.loadEnvFile(".env.local");

import { randomBytes } from "node:crypto";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const NEW_ENTRY = {
  _key: randomBytes(6).toString("hex"),
  _type: "socialLink",
  platform: "Facebook",
  url: "https://www.facebook.com/criticalsandfumbles/",
};

async function patchSocialLinks(dryRun: boolean) {
  const doc = await client.fetch<{
    _id: string;
    socialLinks?: { platform?: string; url?: string }[];
  } | null>(`*[_type == "siteSettings"][0] { _id, socialLinks }`);

  if (!doc) {
    console.log("[SKIP] No siteSettings document found");
    return;
  }

  const existing = doc.socialLinks ?? [];
  const alreadyHasFacebook = existing.some((l) => l.platform === "Facebook");

  console.log(`Current socialLinks: ${existing.length} entries`);
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  if (alreadyHasFacebook) {
    console.log('[SKIP] A "Facebook" entry already exists — not appending a duplicate');
    console.log("--- Done ---");
    return;
  }

  console.log(
    `${dryRun ? "[DRY]" : "[PATCH]"} Append socialLinks entry: ` +
      `{ platform: "Facebook", url: "${NEW_ENTRY.url}" }`,
  );
  console.log(`Result would be ${existing.length + 1} entries; every existing entry untouched.`);

  if (!dryRun) {
    await client
      .patch(doc._id)
      .setIfMissing({ socialLinks: [] })
      .append("socialLinks", [NEW_ENTRY])
      .commit();
  }

  console.log("--- Done ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
patchSocialLinks(isDryRun);
