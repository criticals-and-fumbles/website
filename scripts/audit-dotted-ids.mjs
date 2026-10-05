#!/usr/bin/env node
/**
 * Audits the production dataset for documents of a type that
 * cnf-website's public pages read WITHOUT an auth token
 * (article/campaign/dossier — see sanity/lib/client.ts), whose `_id`
 * contains a dot. Any such document is silently excluded from an
 * anonymous GROQ "published" read even though it reads back fine with
 * a token — see docs/lessons-learned.md's 2026-10-05 entry and issue
 * #32 for the full incident history. This is the automated detection
 * half of that fix; the schema files carry the "don't do this" warning
 * for anyone writing a future script.
 *
 * Exits non-zero (and prints the offending documents) if it finds any,
 * so it can be used as a CI/scheduled-job gate — see
 * .github/workflows/dotted-id-audit.yml.
 *
 * Env vars required: NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET, NEXT_PUBLIC_SANITY_API_VERSION.
 * SANITY_API_READ_TOKEN is optional but recommended — without it this
 * only sees what an anonymous reader would see anyway, which is the
 * exact blind spot this script exists to catch from the OTHER side
 * (the token-authenticated truth of what documents actually exist).
 */

import { createClient } from "@sanity/client";

// Every document type cnf-website's pages read with the public
// (no-token) client — see sanity/lib/client.ts's `client` export and
// its call sites. Update this list if a new type starts being read
// anonymously; this isn't auto-derived from the codebase.
const ANONYMOUSLY_READ_TYPES = ["article", "campaign", "dossier"];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01";

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET env vars.",
  );
  process.exit(2);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function main() {
  // Dots are also legitimate inside drafts.<id> and versions.<bundle>.<id>
  // — those are Sanity's own reserved namespacing, not the bug this
  // script looks for, so they're excluded explicitly rather than relying
  // on the "no drafts in anonymous reads anyway" assumption holding.
  const query = `*[
    _type in $types
    && _id match "*.*"
    && !(_id in path("drafts.**"))
    && !(_id in path("versions.**"))
  ]{ _id, _type, title, "slug": slug.current, status }`;

  const offenders = await client.fetch(query, { types: ANONYMOUSLY_READ_TYPES });

  if (offenders.length === 0) {
    console.log(
      `OK — no dotted-id documents found among ${ANONYMOUSLY_READ_TYPES.join(", ")}.`,
    );
    return;
  }

  console.error(
    `Found ${offenders.length} document(s) with a dotted _id on an anonymously-read type — these are invisible to cnf-website's public pages:\n`,
  );
  for (const doc of offenders) {
    console.error(
      `  - [${doc._type}] _id="${doc._id}" slug="${doc.slug ?? "(none)"}" title="${doc.title ?? "(untitled)"}" status="${doc.status ?? "(none)"}"`,
    );
  }
  console.error(
    "\nFix: recreate each one under a normal Sanity-generated id (see docs/lessons-learned.md's 2026-10-05 entry for the exact script pattern used last time), then delete the dotted-id original.",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("Audit script failed to run:", err);
  process.exit(2);
});
