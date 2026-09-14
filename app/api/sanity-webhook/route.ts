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
 *    neither. A successful Discord create also posts an announcement
 *    to #events-and-happenings (postChannelAnnouncement) using the bot
 *    itself — it was granted Send Messages alongside its existing
 *    Manage Events/Create Events permissions specifically for this.
 *    The scheduled event's own "location" (what Discord renders as the
 *    clickable link on the event card) is set to the event's real URL
 *    — a registration link if one exists, otherwise the site's own
 *    /events/[slug] page — not the physical venue address, which moves
 *    into the description instead so it isn't lost.
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
 *     (2) needs added alongside it. descriptionText (pt::text() — GROQ's
 *     own portable-text-to-plain-text function, no parsing needed in
 *     this route) was added 2026-09 after Eventbrite's Trust & Safety
 *     flagged and unpublished a test listing for having an empty
 *     description — the tagline field alone isn't always populated, but
 *     the real description almost always is:
 *       {
 *         _id, _type, title, tagline, startDate, endDate, location,
 *         capacity, registrationUrl, publishToDiscord,
 *         publishToEventbrite, discordEventId, eventbriteEventId,
 *         "slug": slug.current,
 *         "photoUrl": splashImage.asset->url,
 *         "descriptionText": pt::text(description)
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
 *
 * Eventbrite events are created as DRAFTS, not auto-published (changed
 * 2026-09 after Trust & Safety unpublished a test listing as spam — see
 * createEventbriteEvent's own comment). A human reviews and publishes
 * for real from the Eventbrite dashboard; this route never does that
 * step itself. If neither descriptionText nor tagline has real content,
 * Eventbrite creation is skipped entirely rather than submitting an
 * empty description that would very likely get flagged again.
 */

interface WebhookPayload {
  _id: string;
  _type: "majorEvent" | "regularEvent" | string;
  title: string;
  tagline?: string;
  // Plain text, converted from the rich-text description field by
  // Sanity's own pt::text() in the webhook projection — see the
  // Projection note in the file comment for why (Eventbrite spam flag).
  descriptionText?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  registrationUrl?: string;
  publishToDiscord?: boolean;
  publishToEventbrite?: boolean;
  discordEventId?: string;
  eventbriteEventId?: string;
  // slug is forwarded verbatim to the OG generator, which is what
  // actually uses it, and also used here in resolveEventUrl(). photoUrl
  // is forwarded to the OG generator AND used directly here as the
  // channel announcement embed's image.
  slug?: string;
  photoUrl?: string;
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const EVENTBRITE_TIMEZONE = "Asia/Singapore";
const DEFAULT_TICKET_QUANTITY = 100;
// Same fallback lib/metadata.ts uses — not exported from there, so
// duplicated here rather than adding an export just for this one use.
const SITE_URL = "https://www.criticalsandfumbles.com";

function resolveEndTime(startDate: string, endDate?: string) {
  return endDate ?? new Date(new Date(startDate).getTime() + FOUR_HOURS_MS).toISOString();
}

/** Eventbrite's API rejects Sanity's datetime format outright — Sanity's
 * datetime fields serialize with milliseconds (2026-09-19T11:48:00.000Z),
 * Eventbrite's start.utc/end.utc want exactly YYYY-MM-DDThh:mm:ssZ, no
 * fractional seconds (confirmed via a real 400 ARGUMENTS_ERROR). Discord
 * accepts the millisecond form fine, so this is only needed here. */
function toEventbriteUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** The link a click on the Discord event should land on — prefer a real
 * registration link (e.g. an Eventbrite ticket page) if one exists,
 * otherwise the event's own page on the site. Both majorEvent and
 * regularEvent resolve through the same /events/[slug] route. */
function resolveEventUrl(body: WebhookPayload): string {
  return body.registrationUrl || `${SITE_URL}/events/${body.slug}`;
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
  const eventUrl = resolveEventUrl(body);
  // Discord's "location" field for an EXTERNAL scheduled event is what
  // the client renders as the clickable link on the event card — set to
  // the event's own URL (not the physical address) so clicking through
  // takes people straight to registration/details. The physical
  // location text isn't lost, just moved into the description instead.
  const description = [body.tagline, body.location ? `📍 ${body.location}` : null]
    .filter(Boolean)
    .join("\n\n");

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
        description,
        scheduled_start_time: body.startDate,
        scheduled_end_time: scheduledEndTime,
        privacy_level: 2, // GUILD_ONLY — the only value Discord currently accepts
        entity_type: 3, // EXTERNAL — a real-world event, not a Discord voice/stage channel
        entity_metadata: { location: eventUrl },
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

const DESCRIPTION_PREVIEW_LENGTH = 280;

/** A short, chat-friendly preview — the full descriptionText can be long
 * (it's the whole rich-text body, converted to plain text), which reads
 * as a wall of text in an announcement message rather than an inviting
 * one. Falls back to tagline, then a plain "tap through for details"
 * line rather than leaving the embed with no description at all. */
function previewDescription(body: WebhookPayload): string {
  const text = body.descriptionText || body.tagline;
  if (!text) return "Tap the title above for the full details →";
  return text.length > DESCRIPTION_PREVIEW_LENGTH
    ? `${text.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
    : text;
}

/** Posts an announcement to #events-and-happenings using the bot itself
 * (DISCORD_BOT_TOKEN), now that it's been granted Send Messages
 * alongside its existing Manage Events/Create Events permissions.
 * Optional in practice: skips cleanly (see the call site) if
 * DISCORD_EVENTS_CHANNEL_ID isn't configured yet, same pattern as
 * Eventbrite below. */
async function postChannelAnnouncement(env: CloudflareEnv, body: WebhookPayload) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${env.DISCORD_EVENTS_CHANNEL_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: body.title,
              description: previewDescription(body),
              url: resolveEventUrl(body),
              // The event's own cover image, if it has one — was
              // completely missing before (request: "ensure any image
              // that is attached to event is also posted").
              image: body.photoUrl ? { url: body.photoUrl } : undefined,
              thumbnail: { url: `${SITE_URL}/logo.png` },
              footer: { text: "Criticals & Fumbles", icon_url: `${SITE_URL}/logo.png` },
              fields: [
                body.startDate
                  ? { name: "📅 When", value: `<t:${Math.floor(new Date(body.startDate).getTime() / 1000)}:F>`, inline: true }
                  : undefined,
                body.location ? { name: "📍 Where", value: body.location, inline: true } : undefined,
                body.capacity ? { name: "🎟️ Spots", value: String(body.capacity), inline: true } : undefined,
              ].filter(Boolean),
              color: 0xd4af37, // celestial gold, matching the site's accent colour
            },
          ],
        }),
      },
    );
    if (!response.ok) {
      console.error("Discord channel announcement failed", response.status, await response.text());
    } else {
      console.log("Discord channel announcement posted successfully");
    }
  } catch (err) {
    console.error("Discord channel announcement threw", err);
  }
}

async function createEventbriteEvent(
  env: CloudflareEnv,
  body: WebhookPayload,
  scheduledEndTime: string,
): Promise<{ id: string; url: string } | { error: string } | { skipped: string }> {
  // Eventbrite's Trust & Safety flagged and unpublished a real test
  // listing here for "empty description and no concrete event details,
  // resembling placeholder/gibberish" — reads as spam to their
  // detection, understandably. Prefer the real long-form description
  // over the short tagline; if NEITHER has content, don't submit an
  // empty one and risk the same flag again — skip and let the editor
  // add real content first.
  const descriptionText = body.descriptionText || body.tagline;
  if (!descriptionText) {
    return { skipped: "no description or tagline — Eventbrite requires real event details" };
  }

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
          description: { html: descriptionText },
          start: { timezone: EVENTBRITE_TIMEZONE, utc: toEventbriteUtc(body.startDate!) },
          end: { timezone: EVENTBRITE_TIMEZONE, utc: toEventbriteUtc(scheduledEndTime) },
          currency: "SGD",
          // Hidden from Eventbrite's public search/browse even once
          // published — direct-link only. Extra safety layer alongside
          // never auto-publishing below; if this ever DOES get manually
          // published from the dashboard without changing this, it
          // still won't surface to Eventbrite's spam-review surface the
          // same way a fully public listing does.
          listed: false,
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

  // Deliberately NOT calling /publish/ — left as a draft so a human
  // reviews and publishes for real from the Eventbrite dashboard. This
  // used to auto-publish immediately; that's exactly what got a test
  // listing flagged and unpublished by Trust & Safety. registrationUrl
  // still gets filled in below so the site's Register button points at
  // the right page once it IS published.
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
    if ("id" in discordResult) {
      patch.discordEventId = discordResult.id;
      if (env.DISCORD_EVENTS_CHANNEL_ID) {
        console.log("Posting channel announcement to", env.DISCORD_EVENTS_CHANNEL_ID);
        await postChannelAnnouncement(env, body);
        results.channelAnnouncement = { posted: true };
      } else {
        // Not configured yet — same "skip cleanly" pattern as
        // Eventbrite below, so this ships ahead of that being set up
        // and just starts working once it is.
        console.log("Skipping channel announcement: DISCORD_EVENTS_CHANNEL_ID not configured");
        results.channelAnnouncement = { skipped: "DISCORD_EVENTS_CHANNEL_ID not configured" };
      }
    }
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
