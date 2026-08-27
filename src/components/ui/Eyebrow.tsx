import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-display text-xs font-bold uppercase tracking-[0.12em] text-terracotta",
        className
      )}
    >
      {children}
    </p>
  );
}
