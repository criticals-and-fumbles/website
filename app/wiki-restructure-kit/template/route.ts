import { WIKI_RESTRUCTURE_TEMPLATE_JSON } from "@/lib/wiki-restructure-template";

/**
 * Downloadable JSON template for the Wiki Restructure Kit — same
 * unlinked/noindex tool page family as ../route.ts, see that file's
 * comment for the overall rationale. Content-Disposition makes this a
 * real file save rather than a browser-rendered JSON view, matching
 * campaigns console's own "/console/templates/wiki-restructure.json"
 * download link for the identical shape.
 */
export async function GET() {
  return new Response(WIKI_RESTRUCTURE_TEMPLATE_JSON, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="wiki-restructure-template.json"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
