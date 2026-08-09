export function DivisionCard({
  icon,
  name,
  description,
}: {
  icon: string;
  name: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="font-display text-2xl text-text">{name}</h3>
      <p className="text-sm text-text-muted">{description}</p>
    </div>
  );
}
