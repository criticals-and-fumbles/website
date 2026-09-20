import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import kvTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

// tagCache added 2026-09-20 (cnf-website issue #28) — without one,
// revalidatePath()/revalidateTag() (used by app/api/revalidate/route.ts)
// silently no-op: the adapter falls back to a "dummy" tag cache whose
// isStale() always returns false, so on-demand revalidation never
// actually invalidated the R2-cached page HTML, even though the API
// route reported success. KV is the simplest binding for this project's
// scale; per @opennextjs/cloudflare's own docs this mode is
// "experimental" and eventually-consistent (up to ~60s for a write to
// propagate) — acceptable here since the alternative was "never".
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: kvTagCache,
});
