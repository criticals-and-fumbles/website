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
  }
}

export {};
