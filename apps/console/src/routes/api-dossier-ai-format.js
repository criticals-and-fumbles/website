import { Hono } from "hono";
import { DOSSIER_AI_SYSTEM_PROMPT } from "../lib/import-templates.js";
import { mutate } from "../lib/sanity.js";
import { hashEmail } from "../lib/identity.js";

const app = new Hono();

// Cloudflare's published per-token pricing for MODEL below (checked
// 2026-09), used only to ESTIMATE cost for the aiUsageLog record this
// route writes after every real call — not billing-authoritative, just
// enough for the Horsemen-only usage report (routes/api-ai-usage.js) to
// show trends without needing a Cloudflare API token this Worker
// doesn't have (AI Gateway's own logs/analytics API needs one; the
// Workers AI binding used here doesn't expose bulk log reads at all —
// see that route's file comment for the full reasoning).
const PRICE_PER_INPUT_TOKEN_USD = 0.351 / 1_000_000;
const PRICE_PER_OUTPUT_TOKEN_USD = 0.555 / 1_000_000;

// aiUsageLog is deliberately NOT registered in sanity/schemas/ (no
// Studio editing UI for it — nobody hand-edits telemetry) but is a real
// document type in the same dataset, written/read only by this Worker's
// own routes via the raw mutate/query API, which doesn't require schema
// registration. gmEmailHash follows the exact same reasoning as
// teamMember.ownerEmailHash (see lib/identity.js's file comment) — this
// dataset is publicly readable with no auth, so a plain email here would
// be scrapable. The hash alone doesn't identify a DM to a public reader;
// only the Horsemen-only report route cross-references it against
// teamMember.ownerEmailHash to show a real handle.
async function logAiUsage(c, { success, usage }) {
  if (!usage) return; // no usage object = the call never actually reached the model (e.g. a thrown network error) — nothing was billed
  try {
    const gmEmailHash = await hashEmail(c.env, c.get("gmEmail"));
    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;
    await mutate(c.env, [
      {
        create: {
          _type: "aiUsageLog",
          feature: "dossier-ai-format",
          gmEmailHash,
          success: !!success,
          promptTokens,
          completionTokens,
          neurons: usage.neurons ?? null,
          costUsd: promptTokens * PRICE_PER_INPUT_TOKEN_USD + completionTokens * PRICE_PER_OUTPUT_TOKEN_USD,
        },
      },
    ]);
  } catch (err) {
    // Never let usage logging break the actual feature — a DM's draft
    // generation succeeding matters more than this Worker's own cost
    // telemetry. Logged for whoever's watching Worker logs, not surfaced
    // to the DM.
    console.error("logAiUsage failed:", err);
  }
}

// Model + response_format choice, decided empirically 2026-09-22 after
// testing several combinations live against this exact prompt:
//   - json_schema mode (strict structural enforcement) is NOT supported
//     by this fp8 model at all ("5025: This model doesn't support JSON
//     Schema"). The only non-deprecated Llama model that DOES support
//     it, @cf/meta/llama-3.3-70b-instruct-fp8-fast, produced repeatedly
//     unreliable content under it — reasoning/self-correction text
//     leaking into string fields ("X is incorrect so use Y instead so
//     use Y instead..."), sometimes spiraling into repetition loops,
//     and empty arrays even where the notes clearly supported entries.
//   - This fp8 model with the looser json_object mode instead (a plain
//     "return valid JSON" instruction, structurally unenforced) gave
//     consistently clean, sensible content — but with real shape drift
//     at the edges (a field coming back as a bare string/object instead
//     of the specified array, "text" instead of "title", etc.), since
//     nothing constrains the shape but the prompt's own wording.
// Net choice at that point: the cheap fp8 model + json_object + an
// explicit shape example in DOSSIER_AI_SYSTEM_PROMPT + defensive
// normalizeDraft() below to coerce the shape drift that still showed up.
//
// Upgraded 2026-09-23 to this larger, non-reasoning model, per explicit
// request for "better reasoning" within a 25%-over-current cost ceiling.
// Two things ruled out before landing here:
//   - Reasoning-labeled models (tried @cf/zai-org/glm-4.7-flash) don't
//     fit ANY reasonable ceiling for this task — the hidden chain-of-
//     thought trace alone burned the entire 2048-token output budget
//     before the model even finished the JSON answer, at any
//     reasoning_effort setting. Real cost for a completed call would
//     have been ~450-550% of the fp8 baseline. This task (read prose,
//     extract facts, follow a few consistent rules) isn't the kind of
//     multi-step logical/mathematical problem reasoning-training
//     actually improves — the fp8 model's failures were JSON-shape
//     reliability and decoding stability, not shallow judgment, so
//     "add reasoning" was the wrong lever regardless of cost.
//   - @cf/meta/llama-3.2-11b-vision-instruct priced in-budget (~110% of
//     baseline) but is gated behind a one-time Meta license acceptance
//     ("you represent you are not domiciled in the EU") — a legal
//     representation left for a human to make, not silently agreed to
//     here.
// This model (24B, non-reasoning, real architecture step up) landed at
// ~215-227% of the fp8 baseline in testing — over the original 125%
// ask, but accepted explicitly after showing the real numbers, since
// absolute cost stays trivial (~$0.001/call on a full real session
// recap) at this project's volume. Verified live against a real
// session's prose (not synthetic test text) across two runs: clean,
// non-garbled, well-structured output both times, zero shape drift
// (better than the fp8 model's occasional shape drift, a genuine bonus)
// — one run mislabeled an already-resolved objective as still open, the
// repeat run got it right, consistent with normal model variance rather
// than a systematic blind spot.
const MODEL = "@cf/mistralai/mistral-small-3.1-24b-instruct";

// Enforced HERE, before the model is ever called — this is the actual
// mechanism keeping a request scoped to "one session's notes," not the
// AI Gateway (which provides spend limits/rate limiting/logging, not
// prompt scoping). See issue #29.
const MAX_PROSE_LENGTH = 8000;

// AI Gateway id — created via the Cloudflare dashboard (not scriptable
// via wrangler as of this writing), $5/month spend limit configured
// there. See wrangler.toml's [ai] comment for why no gateway auth token
// is needed for this binding-based call.
const GATEWAY_ID = "cnf-ai-gateway";

// Defensive shape normalization — without schema-constrained decoding
// (json_object mode is a plain "return valid JSON" instruction, not a
// structural guarantee), this model occasionally drifts from the exact
// shape given in the prompt: an array field coming back as a bare
// string/object, an objective using "text" instead of "title", etc.
// Confirmed live 2026-09-22 during testing. Coerce known variations
// into the expected shape rather than 502ing on a technically-usable
// response — the DM reviews everything in the create-dossier form
// before saving regardless, so a slightly-off-but-present entry here is
// far better than losing the whole draft over one field's shape.
const VALID_THREAT_LEVELS = new Set(["low", "medium", "high", "very-high"]);
const VALID_PRIORITIES = new Set(["primary", "secondary", "tertiary"]);
const VALID_STATUSES = new Set(["open", "done"]);

function coerceFactArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object" && (item.label || item.value)) {
        return { label: String(item.label ?? ""), value: String(item.value ?? "") };
      }
      if (typeof item === "string" && item.trim()) return { label: "Note", value: item };
      return null;
    })
    .filter(Boolean);
}

function coerceThreatAssessment(value) {
  if (typeof value === "string") {
    const level = value.toLowerCase().trim();
    return VALID_THREAT_LEVELS.has(level) ? [{ label: "Threat Level", level }] : [];
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const level = String(item.level || "").toLowerCase().trim();
      if (!VALID_THREAT_LEVELS.has(level)) return null;
      return { label: String(item.label || "Threat"), level };
    })
    .filter(Boolean);
}

function coerceObjectives(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const title = String(item.title || item.text || "").trim();
      if (!title) return null;
      const priority = VALID_PRIORITIES.has(item.priority) ? item.priority : "secondary";
      const status = VALID_STATUSES.has(item.status) ? item.status : "open";
      return { title, description: String(item.description || ""), priority, status };
    })
    .filter(Boolean);
}

function coerceLog(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) return { ts: "", entry: item };
      if (item && typeof item === "object" && item.entry) {
        return { ts: String(item.ts || ""), entry: String(item.entry) };
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeDraft(raw) {
  return {
    title: String(raw.title || "").trim(),
    classification: String(raw.classification || ""),
    distribution: String(raw.distribution || ""),
    sessionLabel: String(raw.sessionLabel || ""),
    location: String(raw.location || ""),
    overview: String(raw.overview || ""),
    quickFacts: coerceFactArray(raw.quickFacts),
    locationFacts: coerceFactArray(raw.locationFacts),
    statTiles: coerceFactArray(raw.statTiles),
    threatAssessment: coerceThreatAssessment(raw.threatAssessment),
    objectives: coerceObjectives(raw.objectives),
    log: coerceLog(raw.log),
  };
}

// POST /api/dossier/ai-format — body: { prose }. Returns a structured
// dossier DRAFT for the console to pre-fill into the existing Create
// Dossier form — never writes to Sanity itself. The DM reviews/edits
// the pre-filled form same as any manual entry, then saves through the
// existing POST /api/dossier route (api-dossier.js) — no new write
// path, no new trust boundary, same ownership/sanitizeHtml as always.
app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const prose = body?.prose;

  if (!prose || typeof prose !== "string" || !prose.trim()) {
    return c.json({ error: "prose is required" }, 400);
  }
  if (prose.length > MAX_PROSE_LENGTH) {
    return c.json(
      {
        error: `Notes are too long (${prose.length} characters, max ${MAX_PROSE_LENGTH}) — trim them down, or split into more than one session's dossier.`,
      },
      400,
    );
  }

  let result;
  try {
    result = await c.env.AI.run(
      MODEL,
      {
        messages: [
          { role: "system", content: DOSSIER_AI_SYSTEM_PROMPT },
          { role: "user", content: prose },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
        // Low, not default — confirmed live 2026-09-22 that this task
        // (structured extraction, not creative writing) gets measurably
        // more stable, less rambling output at low temperature than at
        // this model's default sampling.
        temperature: 0.2,
      },
      { gateway: { id: GATEWAY_ID } },
    );
  } catch (err) {
    return c.json({ error: `AI formatting failed: ${err.message}` }, 502);
  }

  // json_object mode returns response as a JSON string, not a parsed
  // object (unlike json_schema mode on models that support it) — see
  // MODEL's comment above for why this project isn't using json_schema
  // mode despite that being more structurally reliable in principle.
  let raw = result?.response;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { raw = null; }
  }
  const usable = raw && typeof raw === "object" && !!String(raw.title || "").trim();

  // Logged regardless of usable/not — the model call itself was billed
  // either way, and "how often does this fail" is exactly what the
  // usage report should be able to show.
  await logAiUsage(c, { success: usable, usage: result?.usage });

  if (!usable) {
    return c.json(
      { error: "The model didn't return a usable draft — try again, or fill in the dossier manually." },
      502,
    );
  }

  return c.json({ ok: true, draft: normalizeDraft(raw) });
});

export default app;
