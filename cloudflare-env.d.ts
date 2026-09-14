/// <reference types="@cloudflare/workers-types" />

// Extends the ambient `CloudflareEnv` interface declared by
// @opennextjs/cloudflare (see node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.d.ts)
// with the bindings this app adds on top of the OpenNext-managed ones.
declare global {
  interface CloudflareEnv {
    OG_IMAGES_BUCKET: R2Bucket;
    /** Secret — set via `wrangler secret put REVALIDATE_SECRET`, checked
     * by app/api/revalidate/route.ts. Not in wrangler.toml (secrets never
     * are); declared here purely for the TypeScript type. */
    REVALIDATE_SECRET: string;
    /** Secret — checked by app/api/publish-event/route.ts against the
     * custom header Sanity's webhook config sends. Same shared-secret
     * pattern as REVALIDATE_SECRET above, not Sanity's own HMAC webhook
     * signing (simpler, consistent with the existing route). */
    PUBLISH_EVENT_WEBHOOK_SECRET: string;
    /** Secret — a Discord bot token (Bot tab, Developer Portal), used by
     * app/api/publish-event/route.ts to create Guild Scheduled Events.
     * The bot must already be invited to DISCORD_SERVER_ID below with
     * the Manage Events + Create Events permissions. */
    DISCORD_BOT_TOKEN: string;
    /** Secret — a Sanity API token with write access (same value as the
     * SANITY_API_WRITE_TOKEN already used by the one-off scripts under
     * sanity/migrations/, via process.env there — this is the same
     * token, just also registered as a Worker secret so the running
     * publish-event route can use it too). Used to patch discordEventId
     * back onto the majorEvent document after creating its Discord
     * event. */
    SANITY_API_WRITE_TOKEN: string;
    /** Plain vars (wrangler.toml [vars]), not secrets — neither value is
     * sensitive on its own (they're public identifiers, not
     * credentials), just the specific server/app the DISCORD_BOT_TOKEN
     * above is scoped to act on. */
    DISCORD_APP_ID: string;
    DISCORD_SERVER_ID: string;
    /** Secret — an Eventbrite Private Token (Account Settings ->
     * Developer Links), used by app/api/publish-event/route.ts.
     * Optional in practice: that route checks for its presence and
     * skips the Eventbrite half cleanly if unset, so this can be added
     * later without redeploying the Discord half. */
    EVENTBRITE_PRIVATE_TOKEN?: string;
    /** Plain var, not a secret — the Eventbrite Organization ID the
     * token above is scoped to. Same "optional, skips cleanly" note as
     * EVENTBRITE_PRIVATE_TOKEN. */
    EVENTBRITE_ORG_ID?: string;
  }
}

export {};
