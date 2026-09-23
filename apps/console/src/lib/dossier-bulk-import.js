import { query, mutate } from "./sanity.js";
import { hashEmail } from "./identity.js";

// Shared between api-import-xml.js and api-import-json.js (added for
// issue #29's addendum — a DM's own external AI agent can now produce
// either format and bulk-import the result). Both parsers
// (lib/xml.js's parseDossiersXml, lib/json-dossier-import.js's
// parseDossiersJson) normalize into the SAME row shape — { code,
// campaignSlug, title, classification, distribution, sessionLabel,
// partyLevel, location, overview, quickFacts, locationFacts, statTiles,
// threatAssessment, objectives, log } — so this file only needs to know
// that shape, never which format it came from.

const MY_CAMPAIGN_SLUGS = `*[_type == "campaign" && ownerEmailHash == $hash]{ _id, "slug": slug.current }`;
const MY_EXISTING_DOSSIER_IDS = `*[_type == "dossier" && campaign->ownerEmailHash == $hash]{ _id, code, "campaignSlug": campaign->slug.current }`;

// "--" separator, not "." — a dotted id like `dossier.${slug}.${code}`
// collides with Sanity's own drafts.<id>/versions.<bundle>.<id>
// namespace convention (see api-dossier.js's identical function for the
// full story). Deterministic id is still wanted here — same
// campaign+code resubmitted should update in place, not duplicate.
export function dossierDocId(campaignSlug, code) {
  return `dossier--${campaignSlug}--${code}`.replace(/[^a-zA-Z0-9-]/g, "-");
}

// Builds createOrReplace mutations from already-parsed dossier rows,
// scoped to the caller's own campaigns — a row targeting a campaignSlug
// the caller doesn't own fails per-row (reported in `failures`), never
// silently importing into someone else's campaign. No silent partial
// imports: every input row ends up counted as created, updated, or
// failed-with-reason.
export async function buildDossierImportMutations(c, parsedRows) {
  const hash = await hashEmail(c.env, c.get("gmEmail"));
  const [campaigns, existing] = await Promise.all([
    query(c.env, MY_CAMPAIGN_SLUGS, { hash }),
    query(c.env, MY_EXISTING_DOSSIER_IDS, { hash }),
  ]);
  const campaignBySlug = new Map(campaigns.map((cmp) => [cmp.slug, cmp._id]));
  const existingKeys = new Set(existing.map((d) => `${d.campaignSlug}::${d.code}`));

  const mutations = [];
  const failed = [];
  let created = 0;
  let updated = 0;

  for (const d of parsedRows) {
    if (!d.code) {
      failed.push({ code: d.code || "(no code)", reason: "Missing dossier id/code" });
      continue;
    }
    const campaignId = campaignBySlug.get(d.campaignSlug);
    if (!campaignId) {
      failed.push({
        code: d.code,
        reason: `Unknown campaignSlug "${d.campaignSlug}" — no matching campaign document`,
      });
      continue;
    }

    const key = `${d.campaignSlug}::${d.code}`;
    if (existingKeys.has(key)) updated++;
    else created++;

    mutations.push({
      createOrReplace: {
        _id: dossierDocId(d.campaignSlug, d.code),
        _type: "dossier",
        code: d.code,
        campaign: { _type: "reference", _ref: campaignId },
        title: d.title,
        classification: d.classification,
        distribution: d.distribution,
        sessionLabel: d.sessionLabel,
        partyLevel: d.partyLevel,
        location: d.location,
        overview: d.overview,
        quickFacts: d.quickFacts,
        locationFacts: d.locationFacts,
        statTiles: d.statTiles,
        threatAssessment: d.threatAssessment,
        objectives: d.objectives,
        log: d.log,
        lastEditedBy: c.get("gmEmail"),
        lastEditedAt: new Date().toISOString(),
      },
    });
  }

  let result = null;
  if (mutations.length > 0) {
    result = await mutate(c.env, mutations, crypto.randomUUID());
  }

  return {
    imported: mutations.length,
    created,
    updated,
    failed: failed.length,
    failures: failed,
    result,
  };
}
