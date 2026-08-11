import type { StatBlock, StatBlockNamedText } from "@/sanity/lib/types";

const ABILITIES: { key: keyof NonNullable<StatBlock["abilities"]>; label: string }[] = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
];

function GradientDivider() {
  return (
    <div
      className="h-[2px] w-full"
      style={{
        background:
          "linear-gradient(to right, var(--color-emerald), var(--color-amber), var(--color-magenta))",
      }}
    />
  );
}

function StatRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <p className="font-ui text-sm text-on-forest">
      <span className="text-on-forest-muted">{label}</span> {value}
    </p>
  );
}

function NamedTextList({
  heading,
  items,
}: {
  heading: string;
  items?: StatBlockNamedText[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-ui text-xs uppercase tracking-wider text-emerald">{heading}</h4>
      {items.map((item, i) => (
        <p key={`${item.name}-${i}`} className="text-sm text-on-forest">
          {item.name && <span className="font-bold italic">{item.name}. </span>}
          {item.text}
        </p>
      ))}
    </div>
  );
}

export function StatBlockCard({
  name,
  statBlock,
}: {
  name: string;
  statBlock: StatBlock;
}) {
  const meta = [statBlock.size, statBlock.creatureType].filter(Boolean).join(" ");

  const hasMetaLine = [statBlock.savingThrows, statBlock.skills].some(Boolean);
  const hasSensesLine = [
    statBlock.senses,
    statBlock.passivePerception,
    statBlock.languages,
    statBlock.challengeRating,
  ].some((v) => v !== undefined && v !== null && v !== "");

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border-[1.5px] border-emerald p-6"
      style={{ background: "#1a1a1a" }}
    >
      <div>
        <h3 className="font-display text-3xl text-on-forest">{name}</h3>
        {meta && <p className="italic text-on-forest-muted">{meta}</p>}
      </div>

      {(statBlock.ac || statBlock.hp || statBlock.speed) && (
        <>
          <GradientDivider />
          <div className="flex flex-col gap-1">
            <StatRow label="Armor Class" value={statBlock.ac} />
            <StatRow label="Hit Points" value={statBlock.hp} />
            <StatRow label="Speed" value={statBlock.speed} />
          </div>
        </>
      )}

      {statBlock.abilities && (
        <>
          <GradientDivider />
          <div className="grid grid-cols-6 gap-2">
            {ABILITIES.map(({ key, label }) => {
              const value = statBlock.abilities?.[key];
              if (value === undefined) return null;
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1 rounded border border-white/10 bg-white/5 p-2 text-center"
                >
                  <span className="font-ui text-xs text-on-forest-muted">{label}</span>
                  <span className="font-display text-lg text-on-forest">{value}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(hasMetaLine || hasSensesLine) && (
        <>
          <GradientDivider />
          <div className="flex flex-col gap-1">
            <StatRow label="Saving Throws" value={statBlock.savingThrows} />
            <StatRow label="Skills" value={statBlock.skills} />
            <StatRow label="Damage Resistances" value={statBlock.resistances} />
            <StatRow label="Damage Immunities" value={statBlock.immunities} />
            <StatRow label="Damage Vulnerabilities" value={statBlock.vulnerabilities} />
            <StatRow label="Condition Immunities" value={statBlock.conditionImmunities} />
            <StatRow label="Senses" value={statBlock.senses} />
            <StatRow label="Passive Perception" value={statBlock.passivePerception} />
            <StatRow label="Languages" value={statBlock.languages} />
            <StatRow label="Challenge" value={statBlock.challengeRating} />
          </div>
        </>
      )}

      {statBlock.traits && statBlock.traits.length > 0 && (
        <>
          <GradientDivider />
          <NamedTextList heading="Traits" items={statBlock.traits} />
        </>
      )}

      {statBlock.actions && statBlock.actions.length > 0 && (
        <>
          <GradientDivider />
          <NamedTextList heading="Actions" items={statBlock.actions} />
        </>
      )}

      {statBlock.legendaryActions && statBlock.legendaryActions.length > 0 && (
        <>
          <GradientDivider />
          <NamedTextList heading="Legendary Actions" items={statBlock.legendaryActions} />
        </>
      )}

      {statBlock.reactions && statBlock.reactions.length > 0 && (
        <>
          <GradientDivider />
          <NamedTextList heading="Reactions" items={statBlock.reactions} />
        </>
      )}
    </div>
  );
}
