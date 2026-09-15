import { Hono } from "hono";
import { query, mutate } from "../lib/sanity.js";
import { resolveMyTeamMember } from "../lib/identity.js";
import { plainTextFromBlocks } from "../lib/portable-text.js";

const app = new Hono();

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

// ~200 words/minute, same rough convention the schema's own field
// description implies ("Auto-calculated hint — override if needed").
function estimateReadTime(plainText) {
  const words = String(plainText || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const MY_ARTICLES_QUERY = `*[_type == "article" && author._ref == $authorId] | order(_createdAt desc){
  _id, title, slug, excerpt, category, tags, coverImage, status, publishedAt, readTimeMinutes
}`;

async function requireMyTeamMember(c) {
  const email = c.get("gmEmail");
  const member = await resolveMyTeamMember(c.env, email);
  if (!member) {
    return {
      error: c.json(
        { error: "No team member profile is linked to this email yet — ask an admin to link one." },
        404,
      ),
    };
  }
  return { member };
}

// GET /api/me/articles — the caller's own articles (any status), most
// recent first. Scoped by resolved teamMemberId, never client-supplied.
app.get("/", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;
  const articles = await query(c.env, MY_ARTICLES_QUERY, { authorId: member._id });
  return c.json({ ok: true, articles });
});

// POST /api/me/articles — body: { title, excerpt, category, tags,
// coverImageAssetId?, body (markdown string), worlds? }. Same "body"
// name PATCH below uses, so the console's create/edit forms can share
// one field map. author/status are always server-set — status is
// always "draft" here, never auto-published; a Studio admin flips it to
// Published after review. slug is derived from title the same way
// campaign/dossier already do, checked for collision (article has no
// deterministic _id scheme to fall back on like those two, so a plain
// uniqueness check is the whole guard).
app.post("/", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;

  const payload = await c.req.json();
  if (!payload.title || !String(payload.title).trim()) {
    return c.json({ error: "title is required" }, 400);
  }

  // A contributor may set a custom SEO-friendly slug instead of the
  // title-derived default — exposed in the console alongside
  // metaDescription (2026-09-15, SEO push) since the two are the same
  // kind of decision: what does a Google searcher see, not what the
  // on-page title says. Still runs through slugify() either way, so a
  // custom value can't produce an invalid/unsafe slug.
  const slug = payload.slug && String(payload.slug).trim() ? slugify(payload.slug) : slugify(payload.title);
  if (!slug) return c.json({ error: "title must contain at least one letter/number" }, 400);

  const existing = await query(c.env, `*[_type == "article" && slug.current == $slug][0]._id`, { slug });
  if (existing) return c.json({ error: `An article with slug "${slug}" already exists — try a different title or slug` }, 409);

  // Plain `create` with NO deterministic _id — unlike campaign/dossier,
  // article documents are read anonymously (no token) by cnf-website's
  // public pages (see sanity/lib/client.ts there: "the dataset is
  // public-read, so this needs no token"). A dotted deterministic id
  // like `article.${slug}` looks, to Sanity's document-versioning system,
  // exactly like its own internal bundle-namespacing convention
  // (`drafts.<id>`, `versions.<bundle>.<id>`) — an unrecognized dotted
  // prefix gets silently excluded from the anonymous "published"
  // perspective even though a token-authenticated read (which is what
  // campaign/dossier always use, and what this console's own GET routes
  // use) sees it fine. Confirmed live: an article created here with id
  // "article.<slug>" existed with correct content and was fully
  // queryable with a token, but never appeared on cnf-website's public
  // /articles page. Every other article in the dataset (created via
  // Sanity Studio) already has a plain, non-dotted id — this now matches
  // that convention instead of inventing a second one. The prior
  // comment's premise (mutate doesn't echo the new id back) doesn't hold
  // for a plain `create` either — Sanity always returns `results[0].id`
  // regardless of whether the caller supplied one, so nothing is lost
  // by not setting `_id` here; see the response handling below.
  const doc = {
    _type: "article",
    title: String(payload.title).trim(),
    slug: { _type: "slug", current: slug },
    excerpt: payload.excerpt ? String(payload.excerpt).trim().slice(0, 200) : undefined,
    // Different job from excerpt above — what shows in Google/social
    // previews, not what a reader sees on the Chronicles listing page.
    // Optional; falls back to excerpt at render time if left blank (see
    // app/(site)/articles/[slug]/page.tsx), not defaulted here.
    metaDescription: payload.metaDescription
      ? String(payload.metaDescription).trim().slice(0, 160)
      : undefined,
    author: { _type: "reference", _ref: member._id },
    category: payload.category || undefined,
    tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : undefined,
    coverImage: payload.coverImageAssetId
      ? { _type: "image", asset: { _type: "reference", _ref: payload.coverImageAssetId } }
      : undefined,
    // body arrives as a real Portable Text block array now (the WYSIWYG
    // editor added 2026-09-15 converts Quill's Delta to blocks entirely
    // client-side — see templates/console.js's deltaToBlocks) — not
    // markdown text, so no server-side markdownToBlocks conversion.
    body: Array.isArray(payload.body) && payload.body.length ? payload.body : undefined,
    readTimeMinutes: estimateReadTime(plainTextFromBlocks(payload.body)),
    worlds: Array.isArray(payload.worlds) && payload.worlds.length
      ? payload.worlds.map((id) => ({ _type: "reference", _ref: id }))
      : undefined,
    featured: false,
    status: "draft",
  };

  try {
    const result = await mutate(c.env, [{ create: doc }]);
    // Sanity always echoes the created document's id back in
    // results[0].id, whether or not the caller supplied one — no need
    // for a self-constructed deterministic id to recover it.
    const id = result?.results?.[0]?.id;
    return c.json({ ok: true, id, result });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

// PATCH /api/me/articles/:id — body: { field, value }. Same single-field
// pattern as api-dossier.js. author/status/featured/publishedAt are not
// self-editable — status changes (draft -> published) go through
// Studio's review step by design (see the article-status product
// decision this route implements); a DM can revise their own draft's
// content freely but can't publish it themselves.
const SELF_EDITABLE_FIELDS = new Set([
  "title", "excerpt", "metaDescription", "slug", "category", "tags", "coverImage", "body", "worlds",
]);

app.patch("/:id", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;

  const id = decodeURIComponent(c.req.param("id"));
  const current = await query(c.env, `*[_id == $id][0]{ "authorId": author._ref }`, { id });
  if (!current) return c.notFound();
  if (current.authorId !== member._id) {
    return c.json({ error: "Forbidden — you are not the author of this article" }, 403);
  }

  const { field, value } = await c.req.json();
  if (!field) return c.json({ error: "field is required" }, 400);
  if (!SELF_EDITABLE_FIELDS.has(field)) {
    return c.json({ error: `"${field}" is not self-editable — ask an admin to change it` }, 400);
  }

  // "body" arrives as a real Portable Text block array (see the POST
  // handler's identical comment) — validated, not converted.
  // "worlds" arrives as a plain array of world _ids from the console's
  // multiSelect, same reference-object wrapping POST already does for
  // it — sending plain strings into a reference-array field would
  // silently store the wrong shape.
  // "slug" changes the article's public URL — re-slugified and
  // uniqueness-checked (excluding this article itself) the same way
  // the POST handler validates a fresh one, then wrapped in the
  // {_type:"slug", current} shape the schema actually expects, not
  // stored as a bare string.
  let finalValue = value;
  if (field === "body") finalValue = Array.isArray(value) ? value : [];
  else if (field === "worlds") {
    finalValue = Array.isArray(value) ? value.map((wid) => ({ _type: "reference", _ref: wid })) : [];
  } else if (field === "slug") {
    const newSlug = slugify(value);
    if (!newSlug) return c.json({ error: "Slug must contain at least one letter/number" }, 400);
    const clash = await query(
      c.env,
      `*[_type == "article" && slug.current == $slug && _id != $id][0]._id`,
      { slug: newSlug, id },
    );
    if (clash) return c.json({ error: `Another article already uses slug "${newSlug}"` }, 409);
    finalValue = { _type: "slug", current: newSlug };
  } else if (field === "metaDescription") {
    finalValue = value ? String(value).trim().slice(0, 160) : undefined;
  }

  // A blank/undefined finalValue means "clear this field" — {set: {x:
  // undefined}} silently does nothing (JSON.stringify drops the key
  // entirely, so the mutation body ends up as an empty set), it does
  // NOT unset it. Real clears need Sanity's unset action instead.
  const mutation =
    finalValue === undefined ? { patch: { id, unset: [field] } } : { patch: { id, set: { [field]: finalValue } } };

  try {
    const result = await mutate(c.env, [mutation]);
    return c.json({ ok: true, result });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

export default app;
