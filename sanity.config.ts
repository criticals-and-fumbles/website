import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "@/sanity/schemas";
import { StudioLogo } from "@/components/studio/StudioLogo";

const SINGLETON_TYPES = new Set(["siteSettings", "philosophy"]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

export default defineConfig({
  name: "cnf-studio",
  title: "Criticals and Fumbles",
  basePath: "/studio",
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
