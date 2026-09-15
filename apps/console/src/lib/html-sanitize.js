/**
 * Allowlist HTML sanitizer for the WYSIWYG editor's dossier.overview
 * field (2026-09-15) — that field is a plain string, not Portable Text,
 * so its rich-text storage format is raw HTML, rendered UNESCAPED on
 * the public campaigns Worker's dossier page (see that repo's
 * templates/dossier.js). Since that's a publicly-readable, publicly-
 * rendered surface, this sanitization on write is the only thing
 * standing between a GM's console input and arbitrary script execution
 * for every visitor to that dossier — it is not optional/defensive
 * dressing, it's the actual security boundary.
 *
 * Uses HTMLRewriter, Cloudflare Workers' built-in streaming HTML
 * parser/transformer (not a dependency, not regex) — a real tokenizer
 * handles malformed/adversarial markup far more reliably than pattern
 * matching would, and this project already avoids adding parser
 * dependencies where a platform primitive covers the need (see
 * lib/portable-text.js's own "no markdown-parser dependency" note for
 * the same philosophy applied to a different format).
 *
 * Allowlist matches exactly what the console's Quill toolbar for this
 * field can produce (see templates/console.js's QUILL_TOOLBAR_OVERVIEW)
 * — nothing here needs to tolerate richer markup than the editor itself
 * offers.
 */

const ALLOWED_TAGS = new Set(["p", "br", "strong", "em", "a", "ul", "ol", "li", "blockquote", "h2", "h3"]);

// Tags whose TEXT CONTENT is itself the dangerous payload (script/style)
// must be removed entirely, not unwrapped-and-kept like an ordinary
// disallowed tag (e.g. a stray <div> Quill would never actually emit,
// where dropping just the wrapper and keeping its text is harmless).
const STRIP_WITH_CONTENT = new Set(["script", "style", "iframe", "object", "embed"]);

export async function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";

  const rewriter = new HTMLRewriter().on("*", {
    element(el) {
      const tag = el.tagName.toLowerCase();
      if (STRIP_WITH_CONTENT.has(tag)) {
        el.remove();
        return;
      }
      if (!ALLOWED_TAGS.has(tag)) {
        el.removeAndKeepContent();
        return;
      }
      // Strip every attribute except a validated href on <a> — collect
      // names first, since removing while iterating el.attributes (a
      // live iterator) skips entries.
      const names = [...el.attributes].map(([name]) => name);
      const href = tag === "a" ? el.getAttribute("href") : null;
      for (const name of names) el.removeAttribute(name);
      if (tag === "a" && href && /^https?:\/\//i.test(href)) {
        el.setAttribute("href", href);
        el.setAttribute("rel", "noopener noreferrer");
        el.setAttribute("target", "_blank");
      }
    },
    // Drops any HTML comment — <!--[if ...]--> conditional-comment
    // style tricks and the like have no legitimate use in an editor
    // that only ever emits Quill's own markup.
    comments(c) {
      c.remove();
    },
  });

  const res = rewriter.transform(new Response(html, { headers: { "content-type": "text/html" } }));
  return await res.text();
}
