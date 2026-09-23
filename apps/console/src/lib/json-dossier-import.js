/**
 * JSON counterpart to xml.js's parseDossiersXml() — matches
 * DOSSIER_JSON_TEMPLATE's shape (lib/import-templates.js). Normalizes
 * into the exact same row shape parseDossiersXml() produces, so
 * lib/dossier-bulk-import.js's mutation builder works identically
 * regardless of which format a DM's file came from. Keep both parsers
 * in sync by hand if the dossier schema changes.
 */

const VALID_THREAT_LEVELS = new Set(["low", "medium", "high", "very-high"]);
const VALID_PRIORITIES = new Set(["primary", "secondary", "tertiary"]);
const VALID_STATUSES = new Set(["open", "done"]);

function str(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function factRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && (r.label || r.value))
    .map((r) => ({ _type: "factRow", _key: crypto.randomUUID(), label: str(r.label), value: str(r.value) }));
}

function statTileRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && (r.label || r.value))
    .map((r) => ({ _type: "statTile", _key: crypto.randomUUID(), value: str(r.value), label: str(r.label) }));
}

function threatRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && VALID_THREAT_LEVELS.has(String(r.level || "").toLowerCase()))
    .map((r) => ({ _type: "meterRow", _key: crypto.randomUUID(), label: str(r.label), level: String(r.level).toLowerCase() }));
}

function objectiveRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && r.title)
    .map((r) => ({
      _type: "objective",
      _key: crypto.randomUUID(),
      title: str(r.title),
      description: str(r.description),
      priority: VALID_PRIORITIES.has(r.priority) ? r.priority : "secondary",
      status: VALID_STATUSES.has(r.status) ? r.status : "open",
    }));
}

function logRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && r.entry)
    .map((r) => ({ _type: "logEntry", _key: crypto.randomUUID(), ts: str(r.ts), entry: str(r.entry) }));
}

// Throws on structurally invalid input (not JSON, no dossiers array) —
// same "malformed file" contract parseDossiersXml() has, caught by the
// route the same way. Per-row problems (missing code/campaignSlug) are
// NOT thrown here — those are still reported per-row by
// buildDossierImportMutations(), same as the XML path, so one bad entry
// doesn't fail the whole file.
export function parseDossiersJson(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  const rows = Array.isArray(parsed) ? parsed : parsed?.dossiers;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No "dossiers" array found in JSON (expected { "dossiers": [...] } or a bare array)');
  }

  return rows.map((n) => ({
    code: str(n?.code),
    campaignSlug: str(n?.campaignSlug),
    title: str(n?.title),
    classification: str(n?.classification),
    distribution: str(n?.distribution),
    sessionLabel: str(n?.sessionLabel),
    partyLevel: str(n?.partyLevel),
    location: str(n?.location),
    overview: str(n?.overview),
    quickFacts: factRows(n?.quickFacts),
    locationFacts: factRows(n?.locationFacts),
    statTiles: statTileRows(n?.statTiles),
    threatAssessment: threatRows(n?.threatAssessment),
    objectives: objectiveRows(n?.objectives),
    log: logRows(n?.log),
  }));
}
