import type { HistoryEntry, Organisation } from "@/sanity/lib/types";
import { Timeline } from "@/components/about/Timeline";

export function AboutIntro({
  visionStatement,
  missionStatement,
  historyTimeline,
  activities,
  organisations,
}: {
  visionStatement?: string;
  missionStatement?: string;
  historyTimeline?: HistoryEntry[];
  activities?: string[];
  organisations: Organisation[];
}) {
  return (
    <div className="mx-auto max-w-5xl">
      {(visionStatement || missionStatement) && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {visionStatement && (
            <div>
              <h2 className="font-display text-3xl text-emerald">Vision</h2>
              <p className="mt-3 text-text-muted">{visionStatement}</p>
            </div>
          )}
          {missionStatement && (
            <div>
              <h2 className="font-display text-3xl text-amber">Mission</h2>
              <p className="mt-3 text-text-muted">{missionStatement}</p>
            </div>
          )}
        </div>
      )}

      {historyTimeline && historyTimeline.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-10 font-display text-4xl text-text">History</h2>
          <Timeline entries={historyTimeline} />
        </div>
      )}

      {activities && activities.length > 0 && (
        <div className="mt-16 text-center">
          <h2 className="mb-8 font-display text-4xl text-text">Activities</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {activities.map((activity) => (
              <span
                key={activity}
                className="rounded-full border border-border px-4 py-2 font-ui text-xs text-text"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>
      )}

      {organisations.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-10 text-center font-display text-4xl text-text">
            Organisations &amp; Partners
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {organisations.map((org) => (
              <div
                key={org._id}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center"
              >
                <span className="font-ui text-sm text-text">{org.name}</span>
                {org.orgType && (
                  <span className="text-xs text-text-muted">{org.orgType}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
