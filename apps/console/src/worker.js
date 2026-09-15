import { Hono } from "hono";
import { requireAccessIdentity } from "./lib/auth.js";
import { configureSanityImage } from "./lib/sanity-image.js";
import consoleRoutes from "./routes/console.js";
import apiDossierRoutes from "./routes/api-dossier.js";
import apiCampaignRoutes from "./routes/api-campaign.js";
import apiUploadRoutes from "./routes/api-upload.js";
import apiExportXmlRoutes from "./routes/api-export-xml.js";
import apiImportXmlRoutes from "./routes/api-import-xml.js";
import apiExportCsvRoutes from "./routes/api-export-csv.js";
import apiImportCsvRoutes from "./routes/api-import-csv.js";
import apiWorldUnitRoutes from "./routes/api-world-unit.js";
import apiFactionRoutes from "./routes/api-faction.js";
import apiKeyFigureRoutes from "./routes/api-key-figure.js";
import apiMagicItemRoutes from "./routes/api-magic-item.js";
import apiLoreEntryRoutes from "./routes/api-lore-entry.js";
import apiNotablePlaceRoutes from "./routes/api-notable-place.js";
import apiImportWikiRoutes from "./routes/api-import-wiki.js";
import apiMeTeamMemberRoutes from "./routes/api-me-team-member.js";
import apiMeArticlesRoutes from "./routes/api-me-articles.js";
import apiAdminRoutes from "./routes/api-admin.js";

// Split out of the old "campaigns" Worker, 2026-09-15 — this Worker is
// now the ENTIRE console.criticalsandfumbles.com subdomain, not a path
// under a domain shared with public dossier pages. Everything here
// requires Cloudflare Access, no exceptions — see lib/auth.js and
// CLAUDE.md. The public dossier/campaign-session pages this used to
// share a domain with stay on the "campaigns" Worker
// (campaigns.criticalsandfumbles.com), unauthenticated, unchanged.
const app = new Hono();

// Binds project ID/dataset once per request so templates can build Sanity
// CDN image URLs without threading env through every render call.
app.use("*", async (c, next) => {
  configureSanityImage({
    projectId: c.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: c.env.NEXT_PUBLIC_SANITY_DATASET,
  });
  await next();
});

// The whole subdomain is Access-gated now — no public routes live here
// at all (contrast the old Worker, which had to selectively gate
// /console/* and /api/* because "/" was the public directory).
app.use("*", requireAccessIdentity);

// Console UI itself at "/" (was mounted at "/console" when this shared
// a domain with the public dossier pages — no longer needed now that
// this Worker's whole domain IS the console). console.js's own routes
// are all relative ("/", "/templates/...") so nothing inside it needed
// to change, only this mount point.
app.route("/", consoleRoutes);
app.route("/api/dossier", apiDossierRoutes);
app.route("/api/campaign", apiCampaignRoutes);
app.route("/api/upload", apiUploadRoutes);
app.route("/api/export.xml", apiExportXmlRoutes);
app.route("/api/import", apiImportXmlRoutes);
app.route("/api/export.csv", apiExportCsvRoutes);
app.route("/api/import/csv", apiImportCsvRoutes);
app.route("/api/world-unit", apiWorldUnitRoutes);
app.route("/api/faction", apiFactionRoutes);
app.route("/api/key-figure", apiKeyFigureRoutes);
app.route("/api/magic-item", apiMagicItemRoutes);
app.route("/api/lore-entry", apiLoreEntryRoutes);
app.route("/api/notable-place", apiNotablePlaceRoutes);
app.route("/api/import/wiki", apiImportWikiRoutes);
app.route("/api/me/team-member", apiMeTeamMemberRoutes);
app.route("/api/me/articles", apiMeArticlesRoutes);
app.route("/api/admin", apiAdminRoutes);

// Catches anything a route didn't handle itself (e.g. a Sanity API call
// throwing because a required env var is missing/misnamed) so a
// misconfiguration shows up as a clear message instead of Cloudflare's
// raw crash page. Ported verbatim from the old Worker's identical
// backstop.
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || "Internal error" }, 500);
});

export default app;
