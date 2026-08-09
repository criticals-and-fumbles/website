"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(
    null,
  );

  useEffect(() => {
    // Date.now() is unavailable/unstable during SSR — computing the initial
    // countdown here (rather than in a useState lazy initializer) avoids a
    // hydration mismatch, at the cost of one extra render on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemaining(target));
    const interval = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!remaining) return null;

  const units: [string, number][] = [
    ["days", remaining.days],
    ["hrs", remaining.hours],
    ["min", remaining.minutes],
    ["sec", remaining.seconds],
  ];

  return (
    <div className="flex gap-4 font-ui" suppressHydrationWarning>
      {units.map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="text-2xl text-emerald md:text-3xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
