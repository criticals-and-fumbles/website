import { Hono } from "hono";
import { query, mutate } from "../lib/sanity.js";
import { resolveMyTeamMember } from "../lib/identity.js";
import { markdownToBlocks, blocksToMarkdown } from "../lib/portable-text.js";

const app = new Hono();

// Mirrors cnf-website's regularEvent.eventType list (sanity/schemas/
// regularEvent.ts) — no shared package between the two repos, so kept in
// sync by hand like ARTICLE_CATEGORIES in templates/console.js.
const EVENT_TYPES = [
  "Campaign", "One-Shot Series", "Drop-In", "Learn to Play", "Playtest",
  "One-shot", "Workshop", "Podcast", "Painting Session", "Others",
];

// Singapore has no DST — a fixed +08:00 offset is always correct, and the
// <input type="datetime-local"> the console sends carries no zone itself.
const SG_OFFSET = "+08:00";

// Each post goes straight to Discord, so cap it per DM per rolling day.
const MAX_POSTS_PER_DAY = 3;

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function toIso(localValue) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(String(localValue || "").trim());
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:00${SG_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const MY_EVENTS_FIELDS = `_id, title, "slug": slug.current, campaignName, eventType, schedule,
  startDate, endDate, status, location, system, playerCount, description,
  "venueId": venue._ref, "worldId": world._ref,
  "discordPosted": defined(discordEventId)`;

// Everything the edit form may change. Deliberately absent: slug (would
// break the public URL), dm, publishToDiscord/publishToEventbrite,
// discordEventId/eventbriteEventId/registrationUrl (Eventbrite + Discord
// publishing state stays server/Studio-owned).
const EVENT_STATUSES = ["Active", "Recruiting", "Full", "Hiatus", "Ended"];

function withMarkdown(events) {
  return events.map((e) => ({ ...e, description: blocksToMarkdown(e.description) }));
}

export const MY_EVENTS_QUERY = `*[_type == "regularEvent" && dm._ref == $memberId]
  | order(_createdAt desc){ ${MY_EVENTS_FIELDS} }`;

// Resolves the venue picker + free-text location into the stored pair.
// The legacy `location` string is always kept populated because the
// Discord webhook's projection reads it (not the venue reference): public
// venues get name + address, private ones only the name.
async function resolvePlace(env, p) {
  let venueRef;
  let location = p.location ? String(p.location).trim().slice(0, 200) : undefined;
  if (p.venueId) {
    const venue = await query(
      env,
      `*[_type == "venue" && _id == $id][0]{ _id, name, visibility, address }`,
      { id: String(p.venueId) },
    );
    if (!venue) return { error: "Selected venue was not found" };
    venueRef = { _type: "reference", _ref: venue._id };
    location =
      venue.visibility !== "private" && venue.address
        ? `${venue.name} - ${String(venue.address).replace(/\s*\n\s*/g, ", ")}`
        : venue.name;
  }
  return { venueRef, location };
}

async function requireMyTeamMember(c) {
  const member = await resolveMyTeamMember(c.env, c.get("gmEmail"));
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

// GET /api/me/events — the caller's own events, scoped by the resolved
// teamMemberId, never client-supplied.
app.get("/", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;
  const events = await query(c.env, MY_EVENTS_QUERY, { memberId: member._id });
  return c.json({ ok: true, events: withMarkdown(events) });
});

// POST /api/me/events — creates a PUBLISHED regularEvent (plain create,
// auto-generated id — never a dotted custom id, see issue #32) that the
// existing Sanity webhook (cnf-website app/api/sanity-webhook) picks up and
// posts to Discord immediately because publishToDiscord is true and
// startDate is set. Everything below is server-set, not client-trusted:
//   dm                  = the caller's own teamMember
//   publishToDiscord    = true
//   publishToEventbrite = false (Eventbrite stays Studio-only)
//   status              = "Recruiting"
// and discordEventId/eventbriteEventId/registrationUrl are never written.
app.post("/", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;

  const p = await c.req.json();
  const title = String(p.title || "").trim();
  if (!title) return c.json({ error: "title is required" }, 400);

  const start = toIso(p.startDate);
  if (!start) return c.json({ error: "startDate is required (date and time)" }, 400);
  if (start.getTime() < Date.now()) return c.json({ error: "startDate must be in the future" }, 400);

  let end = null;
  if (p.endDate) {
    end = toIso(p.endDate);
    if (!end) return c.json({ error: "endDate is not a valid date/time" }, 400);
    if (end <= start) return c.json({ error: "endDate must be after startDate" }, 400);
  }

  if (p.eventType && !EVENT_TYPES.includes(p.eventType)) {
    return c.json({ error: `eventType must be one of: ${EVENT_TYPES.join(", ")}` }, 400);
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = await query(
    c.env,
    `count(*[_type == "regularEvent" && dm._ref == $memberId && _createdAt > $since])`,
    { memberId: member._id, since },
  );
  if (recent >= MAX_POSTS_PER_DAY) {
    return c.json({ error: `Limit of ${MAX_POSTS_PER_DAY} events per 24 hours reached — ask an admin if you need more.` }, 429);
  }

  // Venue: must be a real venue document. The legacy `location` string is
  // also filled in, because the Discord webhook's projection reads
  // `location` (not the venue reference) — public venues get name +
  // address, private ones only the name (never the address).
  const place = await resolvePlace(c.env, p);
  if (place.error) return c.json({ error: place.error }, 400);
  const { venueRef, location } = place;

  const baseSlug = slugify(p.slug || title);
  if (!baseSlug) return c.json({ error: "title must contain at least one letter/number" }, 400);
  // regularEvent and majorEvent share /events/[slug], so check both.
  const slugTaken = (s) =>
    query(c.env, `*[_type in ["regularEvent","majorEvent"] && slug.current == $s][0]._id`, { s });
  let slug = baseSlug;
  if (await slugTaken(slug)) {
    // Recurring titles are common ("Learn to Play") — disambiguate by date.
    slug = `${baseSlug}-${start.toISOString().slice(0, 10).replace(/-/g, "")}`.slice(0, 96);
    if (await slugTaken(slug)) {
      return c.json({ error: `An event with slug "${slug}" already exists — change the title or slug` }, 409);
    }
  }

  const doc = {
    _type: "regularEvent",
    title,
    slug: { _type: "slug", current: slug },
    campaignName: p.campaignName ? String(p.campaignName).trim() : undefined,
    eventType: p.eventType || undefined,
    schedule: p.schedule ? String(p.schedule).trim() : undefined,
    system: p.system ? String(p.system).trim() : undefined,
    playerCount: p.playerCount ? String(p.playerCount).trim() : undefined,
    location,
    venue: venueRef,
    world: p.worldId ? { _type: "reference", _ref: String(p.worldId) } : undefined,
    description: markdownToBlocks(String(p.description || "")),
    startDate: start.toISOString(),
    endDate: end ? end.toISOString() : undefined,
    dm: { _type: "reference", _ref: member._id },
    status: "Recruiting",
    publishToDiscord: true,
    publishToEventbrite: false,
  };

  try {
    const result = await mutate(c.env, [{ create: doc }]);
    const id = result?.results?.[0]?.id;
    return c.json({ ok: true, id, slug });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

// PATCH /api/me/events/:id — body: { fields: { ...form values } }. Only the
// event's own DM may edit it. Same whitelisted fields as the create form
// plus status; a blank string clears an optional field. Editing does NOT
// touch the Discord scheduled event/announcement (the webhook only ever
// creates once — see discordEventId guard), so the form tells the DM so.
app.patch("/:id", async (c) => {
  const { member, error } = await requireMyTeamMember(c);
  if (error) return error;

  const id = decodeURIComponent(c.req.param("id"));
  const current = await query(
    c.env,
    `*[_type == "regularEvent" && _id == $id][0]{ "dmId": dm._ref, startDate, endDate }`,
    { id },
  );
  if (!current) return c.notFound();
  if (current.dmId !== member._id) {
    return c.json({ error: "Forbidden — you are not the DM of this event" }, 403);
  }

  const f = (await c.req.json()).fields || {};
  const set = {};
  const unset = [];
  const text = (key, max = 200) => {
    if (!(key in f)) return;
    const v = String(f[key] ?? "").trim().slice(0, max);
    if (v) set[key] = v;
    else unset.push(key);
  };

  if ("title" in f) {
    const t = String(f.title || "").trim();
    if (!t) return c.json({ error: "title cannot be blank" }, 400);
    set.title = t;
  }
  text("campaignName");
  text("schedule");
  text("system");
  text("playerCount");

  if ("eventType" in f) {
    if (f.eventType && !EVENT_TYPES.includes(f.eventType)) {
      return c.json({ error: `eventType must be one of: ${EVENT_TYPES.join(", ")}` }, 400);
    }
    if (f.eventType) set.eventType = f.eventType; else unset.push("eventType");
  }
  if ("status" in f) {
    if (!EVENT_STATUSES.includes(f.status)) {
      return c.json({ error: `status must be one of: ${EVENT_STATUSES.join(", ")}` }, 400);
    }
    set.status = f.status;
  }
  if ("description" in f) {
    const blocks = markdownToBlocks(String(f.description || ""));
    if (blocks) set.description = blocks; else unset.push("description");
  }
  if ("worldId" in f) {
    if (f.worldId) set.world = { _type: "reference", _ref: String(f.worldId) };
    else unset.push("world");
  }

  let start = current.startDate ? new Date(current.startDate) : null;
  if ("startDate" in f) {
    const d = toIso(f.startDate);
    if (!d) return c.json({ error: "startDate is not a valid date/time" }, 400);
    set.startDate = d.toISOString();
    start = d;
  }
  if ("endDate" in f) {
    if (f.endDate) {
      const d = toIso(f.endDate);
      if (!d) return c.json({ error: "endDate is not a valid date/time" }, 400);
      if (start && d <= start) return c.json({ error: "endDate must be after startDate" }, 400);
      set.endDate = d.toISOString();
    } else unset.push("endDate");
  }

  if ("venueId" in f || "location" in f) {
    const place = await resolvePlace(c.env, f);
    if (place.error) return c.json({ error: place.error }, 400);
    if (place.venueRef) set.venue = place.venueRef; else unset.push("venue");
    if (place.location) set.location = place.location; else unset.push("location");
  }

  if (!Object.keys(set).length && !unset.length) {
    return c.json({ error: "No editable fields supplied" }, 400);
  }

  try {
    await mutate(c.env, [{ patch: { id, ...(Object.keys(set).length ? { set } : {}), ...(unset.length ? { unset } : {}) } }]);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

export default app;
