import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";
  const variants: Record<BadgeVariant, string> = {
    default: "bg-foreground text-white border-transparent",
    secondary: "bg-muted text-foreground border-transparent",
    outline: "bg-transparent text-foreground border-border",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
