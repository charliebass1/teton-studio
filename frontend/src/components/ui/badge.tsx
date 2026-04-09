import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default:
    "bg-[var(--primary)] text-[var(--primary-foreground)]",
  secondary:
    "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
  outline: "text-[var(--foreground)] border",
  destructive:
    "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
};

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
