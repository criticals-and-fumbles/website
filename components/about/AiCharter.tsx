import type { AiCharter as AiCharterData } from "@/sanity/lib/types";
import { Renderer } from "@/components/portable-text/Renderer";

export function AiCharter({ data }: { data: AiCharterData }) {
  const { intro, principles, closingStatement } = data;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-8 text-center font-display text-4xl text-text">
        AI Charter
      </h2>

      {intro && intro.length > 0 && (
        <div className="mb-14 text-center text-text-muted">
          <Renderer value={intro} />
        </div>
      )}

      {principles && principles.length > 0 && (
        <div className="space-y-12">
          {principles.map((principle) => (
            <div key={principle.number}>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl text-emerald">
                  {principle.number}
                </span>
                <h3 className="font-display text-2xl text-text">
                  {principle.title}
                </h3>
              </div>
              {principle.pullQuote && (
                <p className="mt-2 font-display text-xl italic text-emerald">
                  {principle.pullQuote}
                </p>
              )}
              {principle.body && principle.body.length > 0 && (
                <div className="mt-3 text-text-muted">
                  <Renderer value={principle.body} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {closingStatement && closingStatement.length > 0 && (
        <div className="mt-14 rounded-md border-l-4 border-emerald bg-emerald/10 p-6 text-center md:p-8">
          <div className="font-display text-xl text-text">
            <Renderer value={closingStatement} />
          </div>
        </div>
      )}
    </div>
  );
}
