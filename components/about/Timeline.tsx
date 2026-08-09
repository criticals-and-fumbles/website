import type { HistoryEntry } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

export function Timeline({ entries }: { entries: HistoryEntry[] }) {
  if (!entries?.length) return null;

  return (
    <ol className="relative flex flex-col gap-10 border-l border-border pl-8">
      {entries
        .slice()
        .sort((a, b) => a.year - b.year)
        .map((entry) => (
          <li key={`${entry.year}-${entry.displayTitle}`} className="relative">
            <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-emerald" />
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl text-emerald">
                {entry.year}
              </span>
              <h3 className="font-display text-xl text-text">
                {entry.displayTitle}
              </h3>
              {entry.tag && <Badge variant="amber">{entry.tag}</Badge>}
            </div>
            {entry.description && (
              <p className="mt-2 max-w-prose text-sm text-text-muted">
                {entry.description}
              </p>
            )}
          </li>
        ))}
    </ol>
  );
}
