import type { DivisionsSynergy as DivisionsSynergyData } from "@/sanity/lib/types";

/** Renders below DivisionsGrid on the About page's Divisions tab — a
 * short "how the three divisions work together" summary. Content lives
 * entirely in Sanity (divisionsSynergy singleton) so it can be edited
 * without a code change; renders nothing if the document is empty. */
export function DivisionsSynergy({ data }: { data: DivisionsSynergyData | null }) {
  if (!data?.body) return null;

  return (
    <div className="mx-auto mt-14 max-w-3xl border-t border-border pt-10 text-center">
      {data.heading && (
        <h3 className="mb-4 font-display text-2xl text-text">{data.heading}</h3>
      )}
      <p className="text-text-muted">{data.body}</p>
    </div>
  );
}
