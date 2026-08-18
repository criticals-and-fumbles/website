import type { Division } from "@/sanity/lib/types";
import { DivisionCard } from "@/components/about/DivisionCard";

export function DivisionsGrid({ divisions }: { divisions: Division[] }) {
  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-10 text-center font-display text-4xl text-text">
        Divisions
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {divisions.map((division) => (
          <DivisionCard key={division._id} division={division} />
        ))}
      </div>
    </div>
  );
}
