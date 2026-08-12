import Link from "next/link";
import type { SessionLogCard } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

export function UnitSessionCard({
  session,
  worldSlug,
  unitSlug,
}: {
  session: SessionLogCard;
  worldSlug: string;
  unitSlug: string;
}) {
  return (
    <Link
      href={`/wiki/${worldSlug}/${unitSlug}/sessions/${session.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-emerald"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-ui text-xs text-text-muted">
          {session.sessionNumber ? `Session ${session.sessionNumber}` : ""}
        </span>
        {session.tone && <Badge variant="magenta">{session.tone}</Badge>}
      </div>
      <h3 className="font-display text-2xl text-text">{session.title}</h3>
      <p className="font-ui text-xs text-text-muted">
        {[session.dm?.handle, session.sessionDate].filter(Boolean).join(" · ")}
      </p>
      {session.synopsis && (
        <p className="line-clamp-3 text-sm text-text-muted">{session.synopsis}</p>
      )}
    </Link>
  );
}
