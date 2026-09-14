import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/lib/client";

/**
 * Single consolidated Sanity webhook target — does two independent jobs:
 *
 * 1. Forwards majorEvent publishes to the OG-image-generator Worker,
 *    exactly replicating what the "Cloudflare OG Image Generator"
 *    Sanity webhook used to do by pointing directly at it. That webhook
 *    was repointed at THIS route instead (2026-09) because the Sanity
 *    plan's webhook-count limit was hit and no slots were free — see
 *    (2) below for why creating a brand new webhook wasn't an option.
 *    Gated on `_type === "majorEvent"` in CODE, not just trusting
 *    whatever the Sanity-side filter currently allows through — this
 *    is the exact original condition, kept as a hard rule here so a
 *    future change to the Sanity filter can't accidentally start
 *    feeding regularEvent (or anything else) into a Worker endpoint
 *    that was only ever built/tested against majorEvent's shape.
 *
 * 2. Creates a Discord Guild Scheduled Event and/or an Eventbrite
 *    listing the first time an editor checks Publish to Discord /
 *    Publish to Eventbrite (with a Start Date set) on a majorEvent or
 *    regularEvent document, then patches the resulting
 *    discordEventId/eventbriteEventId (and registrationUrl, for
 *    Eventbrite) back so later edits don't create duplicates. The two
 *    integrations are independent — either flag alone, both, or
 *    neither.
 *
 * Both jobs run off the SAME webhook delivery — there was no free
 * webhook slot on the Sanity plan to give (2) its own dedicated
 * webhook, so it was folded into the existing "Cloudflare OG Image
 * Generator" webhook's slot instead of creating a new one.
 *
 * Sanity webhook config (Studio project settings, not code) — this is
 * the EXISTING "Cloudflare OG Image Generator" webhook, repointed:
 *   - Dataset: production, Trigger on: Create + Update
 *   - Filter (GROQ), widened from majorEvent-only to also cover
 *     regularEvent (still excluding drafts, unchanged):
 *       _type in ["majorEvent", "regularEvent"] && !(_id in path("drafts.**"))
 *   - Projection (GROQ) — the webhook's ORIGINAL projection only sent
 *     { slug, title, photoUrl } for the OG generator's own use; this is
 *     that exact same expression, kept verbatim, with everything job
 *     (2) needs added alongside it:
 *       {
 *         _id, _type, title, tagline, startDate, endDate, location,
 *         capacity, registrationUrl, publishToDiscord,
 *         publishToEventbrite, discordEventId, eventbriteEventId,
 *         "slug": slug.current,
 *         "photoUrl": splashImage.asset->url
 *       }
 *   - URL: https://www.criticalsandfumbles.com/api/sanity-webhook
 *     (was: https://cnf-og-generator.criticalsandfumbles.workers.dev/generate/event)
 *   - HTTP method: POST
 *   - Secret headers — this webhook already had its OWN header for the
 *     OG generator's separate auth check before it was repointed here;
 *     kept as-is (the value doesn't change) alongside the new one:
 *       x-og-webhook-secret: <same value as before, now also stored as
 *                              the OG_GENERATOR_WEBHOOK_SECRET Worker
 *                              secret, forwarded by this route below>
 *       x-sanity-webhook-secret: <SANITY_WEBHOOK_SECRET>
 *
 * Same shared-secret-header pattern as app/api/revalidate/route.ts —
 * not Sanity's own HMAC webhook signing, for consistency with that
 * existing route rather than a second, different auth mechanism.
 *
 * Eventbrite is deliberately scoped down for v1: always creates a FREE
 * ticket class regardless of the majorEvent-only ticketPrice field
 * (that field is free text — "Free"/"$10"/"$10-20" — not reliable
 * enough to drive a real paid ticket class from automatically, and this
 * account's payout/banking wasn't confirmed set up at the time this was
 * written). Revisit once real paid ticketing is actually needed.
 */

interface WebhookPayload {
  _id: string;
  _type: "majorEvent" | "regularEvent" | string;
  title: string;
  tagline?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  registrationUrl?: string;
  publishToDiscord?: boolean;
  publishToEventbrite?: boolean;
  discordEventId?: string;
  eventbriteEventId?: string;
  // Not read by this route directly — forwarded verbatim to the OG
  // generator, which is what actually uses these.
  slug?: string;
  photoUrl?: string;
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const EVENTBRITE_TIMEZONE = "Asia/Singapore";
const DEFAULT_TICKET_QUANTITY = 100;

function resolveEndTime(startDate: string, endDate?: string) {
  return endDate ?? new Date(new Date(startDate).getTime() + FOUR_HOURS_MS).toISOString();
}

/** Job (1) — see file comment. Fire-and-forget isn't safe on a Worker
 * (the runtime can freeze the request once the response is sent), so
 * this is awaited like everything else here; a failure here is logged
 * but doesn't block job (2) below — an OG-image regen failing shouldn't
 * stop a Discord/Eventbrite publish from happening. */
async function forwardToOgGenerator(env: CloudflareEnv, body: WebhookPayload) {
  try {
    const response = await fetch(env.OG_GENERATOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This Worker's own separate auth check, pre-existing before
        // this webhook was repointed here — not the same secret as
        // SANITY_WEBHOOK_SECRET below, which only guards THIS route.
        "x-og-webhook-secret": env.OG_GENERATOR_WEBHOOK_SECRET,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error("OG generator forward failed", response.status, await response.text());
    }
  } catch (err) {
    console.error("OG generator forward threw", err);
  }
}

async function createDiscordEvent(
  env: CloudflareEnv,
  body: WebhookPayload,
  scheduledEndTime: string,
): Promise<{ id: string } | { error: string }> {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${env.DISCORD_SERVER_ID}/scheduled-events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.title,
        description: body.tagline ?? "",
        scheduled_start_time: body.startDate,
        scheduled_end_time: scheduledEndTime,
        privacy_level: 2, // GUILD_ONLY — the only value Discord currently accepts
        entity_type: 3, // EXTERNAL — a real-world event, not a Discord voice/stage channel
        entity_metadata: { location: body.location || "TBA" },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Discord scheduled-event creation failed", response.status, errorBody);
    return { error: `Discord API ${response.status}: ${errorBody}` };
  }

  const event = (await response.json()) as { id: string };
  return { id: event.id };
}

async function createEventbriteEvent(
  env: CloudflareEnv,
  body: WebhookPayload,
  scheduledEndTime: string,
): Promise<{ id: string; url: string } | { error: string }> {
  const headers = {
    Authorization: `Bearer ${env.EVENTBRITE_PRIVATE_TOKEN}`,
    "Content-Type": "application/json",
  };

  const createResponse = await fetch(
    `https://www.eventbriteapi.com/v3/organizations/${env.EVENTBRITE_ORG_ID}/events/`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: {
          name: { html: body.title },
          description: { html: body.tagline ?? "" },
          start: { timezone: EVENTBRITE_TIMEZONE, utc: body.startDate },
          end: { timezone: EVENTBRITE_TIMEZONE, utc: scheduledEndTime },
          currency: "SGD",
        },
      }),
    },
  );

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    console.error("Eventbrite event creation failed", createResponse.status, errorBody);
    return { error: `Eventbrite create ${createResponse.status}: ${errorBody}` };
  }

  const event = (await createResponse.json()) as { id: string; url: string };

  // Always a free ticket class in v1 — see the file-level comment.
  const ticketResponse = await fetch(
    `https://www.eventbriteapi.com/v3/events/${event.id}/ticket_classes/`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ticket_class: {
          name: "General Admission",
          quantity_total: body.capacity ?? DEFAULT_TICKET_QUANTITY,
          free: true,
        },
      }),
    },
  );

  if (!ticketResponse.ok) {
    const errorBody = await ticketResponse.text();
    console.error("Eventbrite ticket-class creation failed", ticketResponse.status, errorBody);
    return { error: `Eventbrite ticket class ${ticketResponse.status}: ${errorBody}` };
  }

  const publishResponse = await fetch(
    `https://www.eventbriteapi.com/v3/events/${event.id}/publish/`,
    { method: "POST", headers },
  );

  if (!publishResponse.ok) {
    const errorBody = await publishResponse.text();
    console.error("Eventbrite publish failed", publishResponse.status, errorBody);
    return { error: `Eventbrite publish ${publishResponse.status}: ${errorBody}` };
  }

  return { id: event.id, url: event.url };
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = request.headers.get("x-sanity-webhook-secret");

  if (!secret || secret !== env.SANITY_WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as WebhookPayload | null;
  if (!body?._id || !body.title) {
    return Response.json(
      { error: "Body must include at least _id and title" },
      { status: 400 },
    );
  }

  // Job (1) — see file comment. Only majorEvent, matching the exact
  // original webhook's job before it was repointed here.
  if (body._type === "majorEvent") {
    await forwardToOgGenerator(env, body);
  }

  // Job (2) — see file comment.
  const results: Record<string, unknown> = {};
  const patch: Record<string, string> = {};

  const wantsDiscord = body.publishToDiscord && !body.discordEventId;
  const wantsEventbrite = body.publishToEventbrite && !body.eventbriteEventId && !body.registrationUrl;

  if (!wantsDiscord && !wantsEventbrite) {
    return Response.json({ ogForwarded: body._type === "majorEvent", results });
  }

  if (!body.startDate) {
    // Silent skip, not an error — an editor can check Publish to
    // Discord/Eventbrite before filling in Start Date while drafting.
    // This route just tries again on their next save once it's set,
    // since the *EventId fields are still empty.
    return Response.json({ ogForwarded: body._type === "majorEvent", skipped: "no startDate set yet" });
  }

  const scheduledEndTime = resolveEndTime(body.startDate, body.endDate);

  if (wantsDiscord) {
    const discordResult = await createDiscordEvent(env, body, scheduledEndTime);
    results.discord = discordResult;
    if ("id" in discordResult) patch.discordEventId = discordResult.id;
  } else if (body.publishToDiscord) {
    results.discord = { skipped: "discordEventId already set" };
  }

  if (wantsEventbrite) {
    if (!env.EVENTBRITE_PRIVATE_TOKEN || !env.EVENTBRITE_ORG_ID) {
      // Not configured yet — skip cleanly rather than error, so this
      // can ship ahead of Eventbrite prep being finished and just start
      // working once those secrets are set (wrangler secret put).
      results.eventbrite = { skipped: "EVENTBRITE_PRIVATE_TOKEN/EVENTBRITE_ORG_ID not configured" };
    } else {
      const eventbriteResult = await createEventbriteEvent(env, body, scheduledEndTime);
      results.eventbrite = eventbriteResult;
      if ("id" in eventbriteResult) {
        patch.eventbriteEventId = eventbriteResult.id;
        patch.registrationUrl = eventbriteResult.url;
      }
    }
  } else if (body.publishToEventbrite) {
    results.eventbrite = { skipped: "eventbriteEventId or registrationUrl already set" };
  }

  if (Object.keys(patch).length > 0) {
    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: env.SANITY_API_WRITE_TOKEN,
    });
    await writeClient.patch(body._id).set(patch).commit();
  }

  return Response.json({ ogForwarded: body._type === "majorEvent", results, patched: patch });
}
