// The "standalone" entry point (vs. the default "satori" import) doesn't
// try to auto-load its yoga-layout WASM via fetch/import.meta.url — that
// auto-load is what doesn't work outside Next.js/Vercel's runtime (the
// same class of failure @vercel/og hit). `init()` must be called once
// with the WASM module before the first `satori()` call.
import satori, { init as initSatoriYoga } from "satori/standalone";
import satoriYogaWasmModule from "satori/yoga.wasm";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
// Workers' bundler resolves .wasm imports to a WebAssembly.Module directly
// (no fetch/import.meta.url involved).
import resvgWasmModule from "@resvg/resvg-wasm/index_bg.wasm";
// Noto Sans Regular (OFL-licensed), copied from @vercel/og's own vendored
// copy — satori has no built-in font, it needs real font bytes to render
// any text at all.
import notoSansRegular from "../assets/noto-sans-regular.ttf";
import { defaultImageElement, eventImageElement } from "./templates";

export interface Env {
  OG_IMAGES_BUCKET: R2Bucket;
  /** Shared secret checked against the `x-og-webhook-secret` header on
   * every generate request — set via `wrangler secret put WEBHOOK_SECRET`,
   * paired with the same value in the Sanity webhook's custom headers. */
  WEBHOOK_SECRET: string;
}

const SIZE = { width: 1200, height: 630 };

let wasmReady: Promise<void> | undefined;
function ensureWasmInitialized(): Promise<void> {
  wasmReady ??= Promise.all([
    initWasm(resvgWasmModule),
    initSatoriYoga(satoriYogaWasmModule),
  ]).then(() => undefined);
  return wasmReady;
}

async function renderPng(element: ReturnType<typeof defaultImageElement>): Promise<ArrayBuffer> {
  await ensureWasmInitialized();

  const svg = await satori(element, {
    ...SIZE,
    fonts: [{ name: "Noto Sans", data: notoSansRegular, weight: 400, style: "normal" }],
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: SIZE.width } }).render().asPng();
  return png.buffer as ArrayBuffer;
}

interface EventPayload {
  slug?: string;
  title?: string;
  /** Pre-resolved Sanity CDN URL for the event's splash/cover image, if
   * set — resolved by the Sanity webhook's GROQ projection, not fetched
   * by this worker (keeps this worker Sanity-token-free). */
  photoUrl?: string;
}

/** Satori has no network access of its own — any <img src> must already
 * be a data URI, so external photo URLs (from Sanity's CDN) are fetched
 * and inlined here before rendering. */
async function toDataUri(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const bytes = new Uint8Array(await res.arrayBuffer());

  // Building the binary string in chunks avoids blowing the call stack on
  // String.fromCharCode(...bytes) for larger (multi-hundred-KB) photos.
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return `data:${contentType};base64,${btoa(binary)}`;
}

function isAuthorized(request: Request, env: Env): boolean {
  return (
    Boolean(env.WEBHOOK_SECRET) && request.headers.get("x-og-webhook-secret") === env.WEBHOOK_SECRET
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("ok");
    }

    if (request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    if (!isAuthorized(request, env)) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (url.pathname === "/generate/default") {
      const buffer = await renderPng(defaultImageElement());
      await env.OG_IMAGES_BUCKET.put("og-default.png", buffer, {
        httpMetadata: { contentType: "image/png" },
      });
      return new Response("ok");
    }

    if (url.pathname === "/generate/event") {
      let body: EventPayload;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON body", { status: 400 });
      }
      if (!body.slug) {
        return new Response("Missing slug", { status: 400 });
      }

      const photoDataUri = body.photoUrl ? await toDataUri(body.photoUrl) : undefined;
      const buffer = await renderPng(
        eventImageElement({ title: body.title ?? "Event", photoUrl: photoDataUri }),
      );
      await env.OG_IMAGES_BUCKET.put(`events/${body.slug}.png`, buffer, {
        httpMetadata: { contentType: "image/png" },
      });
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  },
};
