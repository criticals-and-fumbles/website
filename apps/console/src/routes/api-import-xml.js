import { Hono } from "hono";
import { parseDossiersXml } from "../lib/xml.js";
import { buildDossierImportMutations } from "../lib/dossier-bulk-import.js";

const app = new Hono();

// POST /api/import — multipart XML upload; bulk createOrReplace in one
// atomic transaction. Dossiers that fail validation (unresolvable
// campaignSlug, missing code) are excluded from the transaction and
// reported individually — no silent partial imports: every input
// <dossier> ends up counted as created, updated, or failed-with-reason.
// Mutation-building shared with api-import-json.js via
// lib/dossier-bulk-import.js — this route's own job is just parsing XML
// into that shared row shape.
app.post("/", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!file) return c.json({ error: "No XML file provided" }, 400);

  const text = await file.text();

  let parsed;
  try {
    parsed = parseDossiersXml(text);
  } catch (err) {
    return c.json({ error: `Malformed XML: ${err.message}` }, 400);
  }

  try {
    const outcome = await buildDossierImportMutations(c, parsed);
    return c.json({ ok: true, ...outcome });
  } catch (err) {
    return c.json({ error: `Sanity transaction failed: ${err.message}` }, 502);
  }
});

export default app;
