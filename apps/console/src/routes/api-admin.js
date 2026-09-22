import { Hono } from "hono";
import { query, mutate } from "../lib/sanity.js";
import { hashEmail } from "../lib/identity.js";
import { requireAdmin } from "../lib/admin.js";

const app = new Hono();

const ALL_TEAM_MEMBERS_QUERY = `*[_type == "teamMember"] | order(handle asc){
  _id, handle, realName, tier, "linked": defined(ownerEmailHash)
}`;

// GET /api/admin/team-members — every teamMember doc and whether it's
// linked to a login yet. Never returns the email itself (nothing to
// return — only the hash is ever stored, and this doesn't return that
// either since it's of no use to the UI).
app.get("/team-members", async (c) => {
  const { error } = await requireAdmin(c);
  if (error) return error;
  const members = await query(c.env, ALL_TEAM_MEMBERS_QUERY);
  return c.json({ ok: true, members });
});

// POST /api/admin/link-team-member — body: { email, teamMemberId }.
// Computes the hash server-side and sets it — the plain email in the
// request body is never written anywhere, only ever hashed in memory
// for this one request. Overwrites any existing link on that document
// (re-linking/correcting a mistake), which is intentional.
app.post("/link-team-member", async (c) => {
  const { error } = await requireAdmin(c);
  if (error) return error;

  const { email, teamMemberId } = await c.req.json();
  if (!email || !String(email).trim()) return c.json({ error: "email is required" }, 400);
  if (!teamMemberId) return c.json({ error: "teamMemberId is required" }, 400);

  const exists = await query(c.env, `*[_id == $id][0]._id`, { id: teamMemberId });
  if (!exists) return c.json({ error: "No such team member" }, 404);

  const hash = await hashEmail(c.env, email);
  try {
    const result = await mutate(c.env, [{ patch: { id: teamMemberId, set: { ownerEmailHash: hash } } }]);
    return c.json({ ok: true, result });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

// POST /api/admin/unlink-team-member — body: { teamMemberId }. Clears a
// mistaken link (e.g. linked to the wrong person) so it can be redone.
app.post("/unlink-team-member", async (c) => {
  const { error } = await requireAdmin(c);
  if (error) return error;

  const { teamMemberId } = await c.req.json();
  if (!teamMemberId) return c.json({ error: "teamMemberId is required" }, 400);

  try {
    const result = await mutate(c.env, [{ patch: { id: teamMemberId, unset: ["ownerEmailHash"] } }]);
    return c.json({ ok: true, result });
  } catch (err) {
    return c.json({ error: err.message }, 502);
  }
});

const USAGE_LOG_QUERY = `*[_type == "aiUsageLog" && _createdAt > $since]{
  _createdAt, gmEmailHash, success, costUsd, model
}`;
const TEAM_MEMBER_HASHES_QUERY = `*[_type == "teamMember" && defined(ownerEmailHash)]{
  handle, ownerEmailHash
}`;

// GET /api/admin/ai-usage-report — Horsemen-only (see requireAdmin).
// Aggregates apps/console/src/routes/api-dossier-ai-format.js's
// aiUsageLog records into: top 5 DMs by estimated cost, and a per-month
// cost trend. Aggregation happens in JS, not GROQ — call volume here is
// tiny (tens to low hundreds a month, see issue #29's cost projection),
// so fetching raw records and reducing them is simpler and plenty fast,
// not worth fighting GROQ's limited grouping for. costUsd is an
// ESTIMATE computed at log time from published per-token pricing, not
// pulled from Cloudflare's own billing — there is no billing-
// authoritative API this Worker can reach without a dedicated Cloudflare
// API token it doesn't have (see that route's file comment).
app.get("/ai-usage-report", async (c) => {
  const { error } = await requireAdmin(c);
  if (error) return error;

  const sinceDays = Number(c.req.query("days") || 180);
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const [logs, members] = await Promise.all([
    query(c.env, USAGE_LOG_QUERY, { since }),
    query(c.env, TEAM_MEMBER_HASHES_QUERY),
  ]);

  const handleByHash = new Map(members.map((m) => [m.ownerEmailHash, m.handle]));

  const byUser = new Map();
  const byMonth = new Map();
  const byModel = new Map();
  let totalCost = 0;
  let totalCalls = 0;
  let failedCalls = 0;

  for (const log of logs) {
    const cost = Number(log.costUsd) || 0;
    totalCost += cost;
    totalCalls += 1;
    if (!log.success) failedCalls += 1;

    const label = handleByHash.get(log.gmEmailHash) || `Unlinked (${String(log.gmEmailHash || "").slice(0, 8)}…)`;
    const userEntry = byUser.get(label) || { label, cost: 0, calls: 0 };
    userEntry.cost += cost;
    userEntry.calls += 1;
    byUser.set(label, userEntry);

    const month = String(log._createdAt || "").slice(0, 7); // "YYYY-MM"
    if (month) byMonth.set(month, (byMonth.get(month) || 0) + cost);

    // model (added 2026-09-23) — lets a past model swap be spotted after
    // the fact: if pricing constants drift out of sync with MODEL (see
    // that route's file comment for how this actually happened once
    // already), the mismatch shows up here as a model with an
    // implausible cost/call rather than silently blending into the
    // total.
    const modelName = log.model || "(unknown — logged before model tracking was added)";
    const modelEntry = byModel.get(modelName) || { model: modelName, cost: 0, calls: 0 };
    modelEntry.cost += cost;
    modelEntry.calls += 1;
    byModel.set(modelName, modelEntry);
  }

  const topUsers = [...byUser.values()]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map((u) => ({ ...u, cost: Number(u.cost.toFixed(4)) }));

  const monthlyTrend = [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, cost]) => ({ month, cost: Number(cost.toFixed(4)) }));

  const byModelBreakdown = [...byModel.values()]
    .sort((a, b) => b.cost - a.cost)
    .map((m) => ({ ...m, cost: Number(m.cost.toFixed(4)), avgCostPerCall: Number((m.cost / m.calls).toFixed(6)) }));

  return c.json({
    ok: true,
    sinceDays,
    totalCost: Number(totalCost.toFixed(4)),
    totalCalls,
    failedCalls,
    topUsers,
    monthlyTrend,
    byModel: byModelBreakdown,
  });
});

export default app;
