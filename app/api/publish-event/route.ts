import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/lib/client";

/**
 * Sanity webhook target — creates a Discord Guild Scheduled Event and/or
 * an Eventbrite listing the first time an editor checks Publish to
 * Discord / Publish to Eventbrite (with a Start Date set) on a
 * majorEvent or regularEvent document, then patches the resulting
 * discordEventId/eventbriteEventId (and registrationUrl, for Eventbrite)
 * back so later edits don't create duplicates. The two integrations are
 * independent — either flag alone, both, or neither.
 *
 * Configure the Sanity webhook (Studio project settings, not code) as:
 *   - Dataset: production, Trigger on: Create + Update
 *   - Filter (GROQ): _type in ["majorEvent", "regularEvent"] &&
 *       (publishToDiscord == true || publishToEventbrite == true)
 *   - Projection: { _id, _type, title, tagline, startDate, endDate,
 *                    location, capacity, registrationUrl,
 *                    publishToDiscord, publishToEventbrite,
 *                    discordEventId, eventbriteEventId }
 *   - URL: https://www.criticalsandfumbles.com/api/publish-event
 *   - HTTP method: POST
 *   - Secret header: x-publish-event-secret: <PUBLISH_EVENT_WEBHOOK_SECRET>
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
  _type: "majorEvent" | "regularEvent";
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
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const EVENTBRITE_TIMEZONE = "Asia/Singapore";
const DEFAULT_TICKET_QUANTITY = 100;

function resolveEndTime(startDate: string, endDate?: string) {
  return endDate ?? new Date(new Date(startDate).getTime() + FOUR_HOURS_MS).toISOString();
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
  const secret = request.headers.get("x-publish-event-secret");

  if (!secret || secret !== env.PUBLISH_EVENT_WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as WebhookPayload | null;
  if (!body?._id || !body.title) {
    return Response.json(
      { error: "Body must include at least _id and title" },
      { status: 400 },
    );
  }

  const results: Record<string, unknown> = {};
  const patch: Record<string, string> = {};

  const wantsDiscord = body.publishToDiscord && !body.discordEventId;
  const wantsEventbrite = body.publishToEventbrite && !body.eventbriteEventId && !body.registrationUrl;

  if ((wantsDiscord || wantsEventbrite) && !body.startDate) {
    // Silent skip, not an error — an editor can check Publish to
    // Discord/Eventbrite before filling in Start Date while drafting.
    // This route just tries again on their next save once it's set,
    // since the *EventId fields are still empty.
    return Response.json({ skipped: "no startDate set yet" });
  }

  const scheduledEndTime = body.startDate ? resolveEndTime(body.startDate, body.endDate) : undefined;

  if (wantsDiscord && scheduledEndTime) {
    const discordResult = await createDiscordEvent(env, body, scheduledEndTime);
    results.discord = discordResult;
    if ("id" in discordResult) patch.discordEventId = discordResult.id;
  } else if (body.publishToDiscord) {
    results.discord = { skipped: "discordEventId already set" };
  }

  if (wantsEventbrite && scheduledEndTime) {
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

  return Response.json({ results, patched: patch });
}
