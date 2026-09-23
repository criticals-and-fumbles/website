import { query, mutate } from "./sanity.js";

/**
 * Singleton doc controlling the AI Format Dossier feature — a Horsemen-
 * only kill switch (issue #29 addendum, item 5) plus the spend-limit
 * value used for the 80%-threshold alert (item 6). Deliberately NOT
 * registered in sanity/schemas/ (no Studio editing UI — same reasoning
 * as aiUsageLog: nobody hand-edits this, only api-admin.js's
 * ai-feature-config routes do).
 *
 * spendLimitUsd is a value a Horseman types in to MATCH whatever's
 * actually configured as the AI Gateway's spend limit in the Cloudflare
 * dashboard — there's no API this Worker can call to read that value
 * directly (see api-dossier-ai-format.js's file comment on why there's
 * no billing-authoritative API access here), and the dashboard value
 * "may change at any time" per the original request, so this is a
 * manual sync point, not a live read. The 80% alert is computed against
 * THIS stored value, against OUR OWN estimated costUsd sum (not
 * Cloudflare's real billing) — same estimate-not-authoritative caveat
 * that already applies to aiUsageLog.costUsd everywhere else.
 */
const CONFIG_ID = "aiFeatureConfig";

const DEFAULTS = {
  enabled: true,
  disabledAt: null,
  disabledByHash: null,
  disabledReason: null,
  spendLimitUsd: null,
  spendLimitUpdatedAt: null,
};

export async function getAiFeatureConfig(env) {
  const doc = await query(env, `*[_id == $id][0]`, { id: CONFIG_ID });
  return { ...DEFAULTS, ...(doc || {}) };
}

export async function setAiFeatureConfig(env, patch) {
  // Sanity's patch mutation requires the target document to already
  // exist — it can't create one. createIfNotExists in the SAME
  // transaction handles the true-singleton "first write ever" case
  // (a no-op if the doc already exists); the patch right after it then
  // applies the actual requested change either way.
  await mutate(env, [
    { createIfNotExists: { _id: CONFIG_ID, _type: "aiFeatureConfig", ...DEFAULTS } },
    { patch: { id: CONFIG_ID, set: patch } },
  ]);
  return getAiFeatureConfig(env);
}
