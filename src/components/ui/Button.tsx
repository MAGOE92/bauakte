import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-bold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-terracotta text-white hover:bg-terracotta-hover",
  secondary:
    "bg-white text-ink border border-card-border hover:border-terracotta hover:text-terracotta",
  ghost: "text-ink-soft hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5",
  lg: "px-6 py-3 text-base",
};

type CommonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
