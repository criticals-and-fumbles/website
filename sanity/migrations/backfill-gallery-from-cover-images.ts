/**
 * One-off patch: backfills the new `gallery` array field (see
 * sanity/schemas/objects/mediaGalleryItem.ts) with a mediaGalleryItem
 * wrapping each document's existing single-image field, so images
 * uploaded before the /gallery rebuild actually show up on it.
 *
 * `gallery` only ever gets NEW items appended (via .setIfMissing + a
 * deterministic _key per source field, e.g. "backfill-coverImage") — the
 * original coverImage/thumbnail/etc. field is left completely untouched,
 * and re-running this script is a no-op if the backfill entry is already
 * there (checked before appending, not just before running).
 *
 * Scope (checked live before writing this — counts as of 2026-09-16):
 *   world.coverImage        4 docs
 *   worldUnit.coverImage    1 doc
 *   article.coverImage      5 docs
 *   resource.thumbnail      1 doc
 *   regularEvent.coverImage 3 docs
 * Every other opted-in schema/field (worldUnit.mapImage, keyFigure.portrait,
 * notablePlace.images, magicItem.itemArt, faction.banner,
 * loreEntry.coverImage) currently has zero documents with that field set,
 * so there is nothing to backfill there yet — new uploads on those fields
 * going forward should go directly into `gallery`, not the old field.
 *
 * Usage:
 *   npx tsx sanity/migrations/backfill-gallery-from-cover-images.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/backfill-gallery-from-cover-images.ts  # live
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

type SourceImage = {
  asset?: { _ref?: string };
  hotspot?: unknown;
  crop?: unknown;
};

type Doc = {
  _id: string;
  title?: string;
  name?: string;
  image?: SourceImage;
  gallery?: { _key: string }[];
};

const TARGETS: { type: string; field: string }[] = [
  { type: "world", field: "coverImage" },
  { type: "worldUnit", field: "coverImage" },
  { type: "article", field: "coverImage" },
  { type: "resource", field: "thumbnail" },
  { type: "regularEvent", field: "coverImage" },
];

async function backfillOne(type: string, field: string, dryRun: boolean) {
  const backfillKey = `backfill-${field}`;

  const docs = await client.fetch<Doc[]>(
    `*[_type == $type && defined(${field})]{ _id, title, name, "image": ${field}, gallery }`,
    { type },
  );

  console.log(`\n=== ${type}.${field} — ${docs.length} doc(s) with an image set ===`);

  for (const doc of docs) {
    const label = doc.title ?? doc.name ?? doc._id;
    const alreadyBackfilled = (doc.gallery ?? []).some((item) => item._key === backfillKey);

    if (alreadyBackfilled) {
      console.log(`[SKIP] ${label} — already backfilled`);
      continue;
    }
    if (!doc.image?.asset?._ref) {
      console.log(`[SKIP] ${label} — ${field} has no asset ref (shouldn't happen, defined() matched)`);
      continue;
    }

    const galleryItem = {
      _key: backfillKey,
      _type: "mediaGalleryItem",
      kind: "image",
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: doc.image.asset._ref },
        ...(doc.image.hotspot ? { hotspot: doc.image.hotspot } : {}),
        ...(doc.image.crop ? { crop: doc.image.crop } : {}),
      },
    };

    console.log(`${dryRun ? "[DRY]" : "[PATCH]"} ${label} — append gallery item from ${field}`);

    if (!dryRun) {
      await client
        .patch(doc._id)
        .setIfMissing({ gallery: [] })
        .append("gallery", [galleryItem])
        .commit();
    }
  }
}

async function run() {
  const dryRun = process.env.DRY_RUN !== "false";
  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  for (const { type, field } of TARGETS) {
    await backfillOne(type, field, dryRun);
  }

  console.log("\n--- Done ---");
}

run();
