import type { CodeOfConduct as CodeOfConductData, NumberedRule } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

function NumberedRuleCard({ rule }: { rule: NumberedRule }) {
  return (
    <div className="rounded-lg border border-emerald/40 bg-surface p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl text-emerald">{rule.number}</span>
        <h3 className="font-display text-xl text-text">{rule.title}</h3>
      </div>
      {rule.points && rule.points.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {rule.points.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-text-muted">
              <span className="text-emerald">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CodeOfConduct({ data }: { data: CodeOfConductData }) {
  const { introTagline, tableExpectations, safetyComfort, diceRules } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-2 text-center font-display text-4xl text-text">
        Code of Conduct
      </h2>
      {introTagline && (
        <p className="mx-auto mb-12 max-w-xl text-center text-text-muted">
          {introTagline}
        </p>
      )}

      {tableExpectations && tableExpectations.length > 0 && (
        <div className="mb-14">
          <h3 className="mb-6 font-ui text-sm uppercase tracking-wider text-emerald">
            Table Expectations
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {tableExpectations.map((rule) => (
              <NumberedRuleCard key={rule.number} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {safetyComfort && (
        <div className="mb-14 rounded-md border-l-4 border-emerald bg-emerald/10 p-6 md:p-8">
          <h3 className="font-display text-2xl text-emerald">
            {safetyComfort.heading ?? "Safety & Comfort"}
          </h3>

          {safetyComfort.introText && (
            <p className="mt-3 text-text-muted">{safetyComfort.introText}</p>
          )}

          {safetyComfort.tools && safetyComfort.tools.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {safetyComfort.tools.map((tool) => (
                <Badge key={tool} variant="emerald">
                  {tool}
                </Badge>
              ))}
            </div>
          )}

          {safetyComfort.points && safetyComfort.points.length > 0 && (
            <ul className="mt-5 space-y-1.5">
              {safetyComfort.points.map((point) => {
                const isCoreMessage = point.toLowerCase().includes(
                  "player comfort always outweighs narrative consistency",
                );
                return (
                  <li
                    key={point}
                    className={
                      isCoreMessage
                        ? "mt-4 font-display text-xl text-emerald"
                        : "flex gap-2 text-sm text-text-muted"
                    }
                  >
                    {!isCoreMessage && <span className="text-emerald">•</span>}
                    <span>{point}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {diceRules && diceRules.length > 0 && (
        <div>
          <h3 className="mb-6 font-ui text-sm uppercase tracking-wider text-emerald">
            Dice & Rules
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {diceRules.map((rule) => (
              <NumberedRuleCard key={rule.number} rule={rule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
