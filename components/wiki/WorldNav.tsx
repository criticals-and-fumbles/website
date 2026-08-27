import Link from "next/link";

const TABS = [
  { key: "lore", label: "Lore", enabled: true },
  { key: "sessions", label: "Sessions", enabled: true },
  { key: "figures", label: "NPCs", enabled: true },
  { key: "factions", label: "Factions", enabled: true },
  { key: "places", label: "Places", enabled: true },
  { key: "items", label: "Items", enabled: true },
  { key: "map", label: "Map", enabled: false },
] as const;

export function WorldNav({
  worldSlug,
  active,
}: {
  worldSlug: string;
  active?: (typeof TABS)[number]["key"];
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border font-ui text-sm">
      {TABS.map((tab) => {
        if (!tab.enabled) {
          return (
            <span
              key={tab.key}
              title="Coming soon"
              className="cursor-not-allowed px-4 py-3 text-text-muted/50"
            >
              {tab.label}
            </span>
          );
        }

        const isActive = active === tab.key;

        return (
          <Link
            key={tab.key}
            href={`/wiki/${worldSlug}/${tab.key}`}
            className={`border-b-2 px-4 py-3 transition-colors ${
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
