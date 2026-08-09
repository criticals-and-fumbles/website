export function StatBar({ label, value }: { label: string; value?: number }) {
  const score = Math.max(0, Math.min(20, value ?? 0));
  const filled = Math.round((score / 20) * 10);

  return (
    <div className="flex items-center gap-2 font-ui text-xs">
      <span className="w-4 text-text-muted">{label}</span>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < filled ? "bg-emerald" : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className="text-text-muted">{score}</span>
    </div>
  );
}
