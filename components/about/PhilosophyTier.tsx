import type { PhilosophyBehaviour, PhilosophyPillar } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

const TIER_COLORS = {
  1: { text: "text-emerald", border: "border-emerald/40", badge: "emerald" },
  2: { text: "text-amber", border: "border-amber/40", badge: "amber" },
  3: { text: "text-magenta", border: "border-magenta/40", badge: "magenta" },
} as const;

export function PillarsTier({ pillars }: { pillars: PhilosophyPillar[] }) {
  const colors = TIER_COLORS[1];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {pillars.map((pillar) => (
        <div
          key={pillar.name}
          className={`rounded-lg border ${colors.border} bg-surface p-6`}
        >
          <span className={`font-display text-4xl ${colors.text}`}>
            {pillar.romanNumeral}
          </span>
          <h3 className="mt-2 font-display text-2xl text-text">{pillar.name}</h3>
          {pillar.tagline && (
            <p className="mt-1 text-sm italic text-text-muted">{pillar.tagline}</p>
          )}
          {pillar.values && pillar.values.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pillar.values.map((value) => (
                <Badge key={value} variant={colors.badge}>
                  {value}
                </Badge>
              ))}
            </div>
          )}
          {pillar.description && (
            <p className="mt-3 text-sm text-text-muted">{pillar.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function BehavioursTier({
  items,
  tier,
}: {
  items: PhilosophyBehaviour[];
  tier: 2 | 3;
}) {
  const colors = TIER_COLORS[tier];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.name}
          className={`rounded-lg border ${colors.border} bg-surface p-6`}
        >
          <h3 className={`font-display text-2xl ${colors.text}`}>{item.name}</h3>
          {item.title && (
            <p className="mt-1 text-sm italic text-text-muted">{item.title}</p>
          )}
          {item.description && (
            <p className="mt-3 text-sm text-text-muted">{item.description}</p>
          )}
          {item.flavourLine && (
            <p className={`mt-3 font-ui text-xs ${colors.text}`}>
              {item.flavourLine}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
