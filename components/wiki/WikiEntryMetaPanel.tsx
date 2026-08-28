import Image from "next/image";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/sanity/lib/image";
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
  /** The entry's own name/title — shown as the infobox title bar. */
  title: string;
  /** Portrait/cover/banner/item-art image, whichever field this type has —
   * omit entirely if the type/document has none set. */
  image?: SanityImageSource;
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
  /** worldUnit only — quick links to this unit's content categories
   * (Lore, Key Figures, Notable Places, Magic Items, Factions), always
   * shown regardless of whether each category has any entries yet —
   * unlike `counts`, which only shows categories that already have
   * content. Omit entirely for non-worldUnit entry types. */
  categoryLinks?: { label: string; href: string }[];
  siblingsHeading: string;
  siblings: { title: string; href: string }[];
  /** Nav link back to this entry's immediate parent in the wiki hierarchy
   * (World → World Unit → entity/lore/session) — rendered at the very
   * top of the panel, right under the title bar. Omit for the top of the
   * hierarchy (a World itself), which has no parent entry. */
  parentLink?: { label: string; href: string };
  /** ALL of this entry's own child documents, grouped by type and
   * rendered as the panel's lowest section — distinct from `siblings`
   * (other entries at the SAME level) and `categoryLinks` (worldUnit's
   * shortcut links to each category's browse page, not an actual
   * listing). Omit entirely for entry types with no children (every
   * leaf type — keyFigure/notablePlace/magicItem/faction/loreEntry/
   * sessionLog). Groups with zero items should be filtered out by the
   * caller before this prop is set. */
  childGroups?: { heading: string; items: { title: string; href: string }[] }[];
}

/** Wikipedia/Fandom-style infobox: title bar, image, labeled key/value
 * rows, "See also"-style list at the bottom. */
export function WikiEntryMetaPanel({
  title,
  image,
  typeLabel,
  statusChip,
  counts,
  ownerHandle,
  createdAt,
  updatedAt,
  lastEditedByHandle,
  categoryLinks,
  siblingsHeading,
  siblings,
  parentLink,
  childGroups,
}: WikiEntryMetaPanelProps) {
  const owner = firstName(ownerHandle);
  const lastEditor = firstName(lastEditedByHandle);
  const imageUrl = urlForImage(image)?.width(480).height(360).auto("format").url();
  const totalChildren = childGroups?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;

  return (
    <aside className="overflow-hidden rounded-md border border-border bg-surface text-sm">
      <div className="border-b border-border bg-bg-forest px-4 py-2 text-center">
        <span className="font-display text-lg text-on-forest">{title}</span>
      </div>

      {parentLink && (
        <Link
          href={parentLink.href}
          className="flex items-center gap-1.5 border-b border-border px-4 py-2 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-emerald"
        >
          <span aria-hidden="true">←</span>
          {parentLink.label}
        </Link>
      )}

      {imageUrl && (
        <div className="relative aspect-[4/3] w-full border-b border-border bg-bg-forest">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
      )}

      <dl className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
          <dt className="font-ui text-xs uppercase tracking-wider text-text-muted">
            {typeLabel}
          </dt>
          {statusChip && <dd><Badge variant={statusChip.variant}>{statusChip.label}</Badge></dd>}
        </div>

        {counts && counts.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-ui text-xs text-text-muted">
            {counts.map((c) => (
              <span key={c.label}>
                {c.value} {c.label}
              </span>
            ))}
          </div>
        )}

        {owner && (
          <div className="border-b border-border px-4 py-2">
            <dt className="font-ui text-xs uppercase tracking-wider text-text-muted">
              Maintained by
            </dt>
            <dd className="text-text">{owner}</dd>
          </div>
        )}

        <div className="border-b border-border px-4 py-2">
          <dt className="font-ui text-xs uppercase tracking-wider text-text-muted">
            Created
          </dt>
          <dd className="text-text">{formatMonthYear(createdAt)}</dd>
        </div>

        <div className="border-b border-border px-4 py-2">
          <dt className="font-ui text-xs uppercase tracking-wider text-text-muted">
            Updated
          </dt>
          <dd className="text-text">{formatMonthYear(updatedAt)}</dd>
        </div>

        {lastEditor && (
          <div className="border-b border-border px-4 py-2">
            <dt className="font-ui text-xs uppercase tracking-wider text-text-muted">
              Last edited by
            </dt>
            <dd className="text-text">{lastEditor}</dd>
          </div>
        )}
      </dl>

      {categoryLinks && categoryLinks.length > 0 && (
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
          <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
            Browse
          </span>
          <ul className="flex flex-col gap-1.5">
            {categoryLinks.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {siblings.length > 0 && (
        <div
          className={`flex flex-col gap-2 px-4 py-3 ${
            childGroups && childGroups.length > 0 ? "border-b border-border" : ""
          }`}
        >
          <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
            {siblingsHeading}
          </span>
          <ul className="flex flex-col gap-1.5">
            {siblings.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="line-clamp-1 text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lowest section, per design: ALL of this entry's own children,
          grouped by type. Collapsed by default once the list gets long
          enough to dominate the panel — same <details> convention as the
          wiki article Contents box — so a busy World Unit's infobox
          doesn't force everything else below it off-screen. */}
      {childGroups && childGroups.length > 0 && (
        <details className="px-4 py-3" open={totalChildren <= 6}>
          <summary className="cursor-pointer font-ui text-xs uppercase tracking-wider text-text-muted">
            All Entries{totalChildren > 0 ? ` (${totalChildren})` : ""}
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {childGroups.map((group) => (
              <div key={group.heading} className="flex flex-col gap-1.5">
                <span className="font-ui text-[0.7rem] uppercase tracking-wider text-text-muted/80">
                  {group.heading}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="line-clamp-1 text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </aside>
  );
}
