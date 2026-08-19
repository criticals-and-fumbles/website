import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * On-demand ISR revalidation — forces a specific path's cached HTML to
 * regenerate immediately instead of waiting for its own revalidate
 * window. Needed because the R2-backed incremental cache
 * (open-next.config.ts) persists across deploys — a new deploy doesn't
 * purge previously-cached pages, so without this, a page can keep
 * serving pre-deploy HTML well past its nominal revalidate time if
 * real traffic isn't hitting it often enough to trigger the background
 * regen. See docs/seo-and-infra.md § R2 bucket for the underlying cache
 * mechanism this works around.
 *
 * POST /api/revalidate with header x-revalidate-secret matching the
 * REVALIDATE_SECRET Worker secret, body { "path": "/events" }.
 */
export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = request.headers.get("x-revalidate-secret");

  if (!secret || secret !== env.REVALIDATE_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const path = body?.path;

  if (typeof path !== "string" || !path.startsWith("/")) {
    return Response.json(
      { error: "Body must be JSON with a \"path\" string starting with /" },
      { status: 400 },
    );
  }

  revalidatePath(path);
  return Response.json({ revalidated: true, path, now: Date.now() });
}
