import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  className,
  overBudget = false,
}: {
  percent: number;
  className?: string;
  overBudget?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-cream-soft", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          overBudget ? "bg-danger" : "bg-terracotta"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
