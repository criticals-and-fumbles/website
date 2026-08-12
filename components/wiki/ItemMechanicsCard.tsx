import type { ItemMechanics } from "@/sanity/lib/types";

export function ItemMechanicsCard({
  name,
  mechanics,
}: {
  name: string;
  mechanics: ItemMechanics;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border-[1.5px] border-emerald p-6"
      style={{ background: "#1a1a1a" }}
    >
      <h3 className="font-display text-2xl text-on-forest">{name}</h3>
      {mechanics.itemTypeDetail && (
        <p className="font-ui text-sm text-on-forest">
          <span className="text-on-forest-muted">Type</span> {mechanics.itemTypeDetail}
        </p>
      )}
      {mechanics.attunement && (
        <p className="font-ui text-sm text-on-forest">
          <span className="text-on-forest-muted">Requires Attunement</span>{" "}
          {mechanics.attunement}
        </p>
      )}
      {mechanics.text && (
        <p className="text-sm text-on-forest">{mechanics.text}</p>
      )}
    </div>
  );
}
