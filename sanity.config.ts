import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemas";
import { StudioLogo } from "./components/studio/StudioLogo";

const SINGLETON_TYPES = new Set(["siteSettings", "philosophy"]);

// Hardcoded rather than read from process.env: this file's only consumer
// is now the standalone `sanity` CLI (sanity dev / sanity deploy), which
// does not load .env.local the way Next.js does — those vars would be
// undefined here, which is what broke the first Studio deploy (Studio had
// no project ID to connect to). These aren't secrets — same values as
// NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / _API_VERSION in .env.local.
const projectId = "grfq47ig";
const dataset = "production";
const apiVersion = "2026-06-01";

export default defineConfig({
  name: "cnf-studio",
  title: "Criticals and Fumbles",
  // Deployed standalone via `sanity deploy` to the root of its own
  // *.sanity.studio subdomain — NOT embedded under /studio in the Next.js
  // app (see CLAUDE.md § Sanity Studio is hosted separately). basePath
  // must match where Studio is actually served, or its router breaks with
  // an unrecoverable error.
  projectId,
  dataset,
  schema,
  studio: {
    components: {
      logo: StudioLogo,
    },
  },
  document: {
    // Singletons: no duplicate/delete — only publish/discard/restore.
    actions: (prevActions, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? prevActions.filter(
            ({ action }) =>
              action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : prevActions,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document().schemaType("siteSettings").documentId("siteSettings"),
              ),
            S.listItem()
              .title("Philosophy")
              .id("philosophy")
              .child(
                S.document().schemaType("philosophy").documentId("philosophy"),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !SINGLETON_TYPES.has(item.getId() ?? ""),
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
