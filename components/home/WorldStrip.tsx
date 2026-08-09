import type { World } from "@/sanity/lib/types";
import { WorldCard } from "@/components/wiki/WorldCard";

export function WorldStrip({ worlds }: { worlds: World[] }) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 font-display text-4xl text-text">Wiki Worlds</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {worlds.map((world) => (
            <WorldCard key={world._id} world={world} />
          ))}
        </div>
      </div>
    </section>
  );
}
