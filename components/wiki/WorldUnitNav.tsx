import Link from "next/link";

const TABS = [
  { key: "lore", label: "Lore" },
  { key: "figures", label: "Key Figures" },
  { key: "places", label: "Notable Places" },
  { key: "items", label: "Magic Items" },
  { key: "factions", label: "Factions" },
  { key: "sessions", label: "Sessions" },
] as const;

export function WorldUnitNav({
  worldSlug,
  unitSlug,
  active,
}: {
  worldSlug: string;
  unitSlug: string;
  active?: (typeof TABS)[number]["key"];
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border font-ui text-sm">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={`/wiki/${worldSlug}/${unitSlug}/${tab.key}`}
            className={`shrink-0 border-b-2 px-4 py-3 transition-colors ${
              isActive
                ? "border-emerald text-emerald"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
