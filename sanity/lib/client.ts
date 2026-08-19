import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01";

/**
 * Public client — use for all production page fetches. useCdn:false
 * (changed from true 2026-08-20): api.sanity.io always serves the current
 * document, apicdn.sanity.io is a real CDN with its own per-edge-node
 * cache that can lag independently per request. Root cause of a real
 * incident — two components in the SAME build, both calling
 * client.fetch(SITE_SETTINGS_QUERY) with the identical query string,
 * returned different socialLinks arrays (one had a just-added entry, one
 * didn't) because each request could land on a different CDN edge node
 * with a different propagation state. Confirmed by querying api.sanity.io
 * directly (always correct) vs apicdn.sanity.io (inconsistent) with the
 * exact same query. The dataset is public-read, so this needs no token;
 * the tradeoff is marginally higher latency per request, worth it for a
 * low-traffic site over silently-inconsistent content. The campaigns
 * subsite (separate repo, same Sanity project) already only ever uses
 * api.sanity.io, never the CDN, for the same reason. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

/**
 * Token-authenticated client for previewing draft content.
 * Never import this into client components — SANITY_API_READ_TOKEN is server-only.
 */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
});

export function getClient(preview = false) {
  return preview ? previewClient : client;
}
