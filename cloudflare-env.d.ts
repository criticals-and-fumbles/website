/// <reference types="@cloudflare/workers-types" />

// Extends the ambient `CloudflareEnv` interface declared by
// @opennextjs/cloudflare (see node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.d.ts)
// with the bindings this app adds on top of the OpenNext-managed ones.
declare global {
  interface CloudflareEnv {
    OG_IMAGES_BUCKET: R2Bucket;
  }
}

export {};
