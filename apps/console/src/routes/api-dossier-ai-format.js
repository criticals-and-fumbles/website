import { Hono } from "hono";
import { DOSSIER_AI_SYSTEM_PROMPT } from "../lib/import-templates.js";

const app = new Hono();

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
// Net choice: this cheaper model + json_object + an explicit shape
// example in DOSSIER_AI_SYSTEM_PROMPT + defensive normalizeDraft()
// below to coerce the shape drift that still shows up. If real DM usage
// shows content quality problems instead of shape ones, that's the
// signal to revisit — not swapping back to json_schema mode, which
// tested strictly worse on content here regardless of model.
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

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
  if (!raw || typeof raw !== "object" || !String(raw.title || "").trim()) {
    return c.json(
      { error: "The model didn't return a usable draft — try again, or fill in the dossier manually." },
      502,
    );
  }

  return c.json({ ok: true, draft: normalizeDraft(raw) });
});

export default app;
