import { Hono } from "hono";
import { parseDossiersJson } from "../lib/json-dossier-import.js";
import { buildDossierImportMutations } from "../lib/dossier-bulk-import.js";

const app = new Hono();

// POST /api/import-json — JSON counterpart to POST /api/import (XML),
// added for issue #29's addendum so a DM can use their own external AI
// agent (see DOSSIER_JSON_TEMPLATE, lib/import-templates.js) instead of
// the console's built-in AI Format Dossier tool. Same multipart file
// upload, same shared mutation-builder (lib/dossier-bulk-import.js), so
// behavior (per-row failure reporting, createOrReplace by code+
// campaignSlug, ownership scoping) is identical to the XML path — only
// the file format and parser differ.
app.post("/", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!file) return c.json({ error: "No JSON file provided" }, 400);

  const text = await file.text();

  let parsed;
  try {
    parsed = parseDossiersJson(text);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }

  try {
    const outcome = await buildDossierImportMutations(c, parsed);
    return c.json({ ok: true, ...outcome });
  } catch (err) {
    return c.json({ error: `Sanity transaction failed: ${err.message}` }, 502);
  }
});

export default app;
