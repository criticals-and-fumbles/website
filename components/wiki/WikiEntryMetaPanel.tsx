import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type BadgeVariant = "emerald" | "amber" | "magenta" | "muted" | "surface";

/** First word of a handle/name — e.g. "Brian Hardy" → "Brian". Never a
 * full name or email, per this feature's spec. */
function firstName(handle?: string): string | undefined {
  return handle?.trim().split(/\s+/)[0];
}

function formatMonthYear(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-SG", {
    month: "short",
    year: "numeric",
  });
}

export interface WikiEntryMetaPanelProps {
  /** e.g. "Territory", "Key Figure", "Notable Place" — the small type label
   * shown above/alongside the status chip. */
  typeLabel: string;
  /** Native status-ish field for this type (developmentStatus, status,
   * threatLevel, dangerLevel, rarity). Omitted when `counts` is used
   * instead (worldUnit hub pages). */
  statusChip?: { label: string; variant: BadgeVariant };
  /** worldUnit only — aggregate counts of everything under it, shown
   * instead of a single status chip since it's a hub page. */
  counts?: { label: string; value: number }[];
  /** From whichever existing teamMember-reference field Step 0 found for
   * this type (dmOwner/dm) — omit the prop entirely if none exists. */
  ownerHandle?: string;
  createdAt: string;
  updatedAt: string;
  /** From the new lastEditedBy field — omit if not set on the document. */
  lastEditedByHandle?: string;
  siblingsHeading: string;
  siblings: { title: string; href: string }[];
}

export function WikiEntryMetaPanel({
  typeLabel,
  statusChip,
  counts,
  ownerHandle,
  createdAt,
  updatedAt,
  lastEditedByHandle,
  siblingsHeading,
  siblings,
}: WikiEntryMetaPanelProps) {
  const owner = firstName(ownerHandle);
  const lastEditor = firstName(lastEditedByHandle);

  return (
    <aside className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
          {typeLabel}
        </span>
        {statusChip && <Badge variant={statusChip.variant}>{statusChip.label}</Badge>}
      </div>

      {counts && counts.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-ui text-xs text-text-muted">
          {counts.map((c) => (
            <span key={c.label}>
              {c.value} {c.label}
            </span>
          ))}
        </div>
      )}

      {owner && (
        <p className="text-text-muted">
          Maintained by <span className="text-text">{owner}</span>
        </p>
      )}

      <p className="font-ui text-xs text-text-muted">
        Created {formatMonthYear(createdAt)} · Updated {formatMonthYear(updatedAt)}
      </p>

      {lastEditor && (
        <p className="text-text-muted">
          Last updated by <span className="text-text">{lastEditor}</span>
        </p>
      )}

      {siblings.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
            {siblingsHeading}
          </span>
          <ul className="flex flex-col gap-1.5">
            {siblings.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="line-clamp-1 text-text-muted transition-colors hover:text-emerald"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
