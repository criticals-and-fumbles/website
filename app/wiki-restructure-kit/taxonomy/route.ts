import { WORLDBOOK_TAXONOMY_BODY } from "@/lib/worldbook-taxonomy-content";

/**
 * Companion page to /wiki-restructure-kit — the canonical heading
 * taxonomy + per-world migration maps, linked from that kit's intro.
 * Same rationale (unlinked, login-free, raw Route Handler) — see that
 * route's own file comment.
 */
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Worldbook Taxonomy</title>
</head>
<body>
${WORLDBOOK_TAXONOMY_BODY}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
