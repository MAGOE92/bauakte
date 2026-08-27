import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-card-border bg-white p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
          {label}
        </p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
            {icon}
          </span>
        )}
      </div>
      <p className="font-display mt-3 text-3xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
