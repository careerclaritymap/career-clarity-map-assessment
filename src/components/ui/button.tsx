import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "default", disabled, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none px-4 py-2";
  const variants: Record<ButtonVariant, string> = {
    default: "bg-foreground text-white hover:opacity-90",
    secondary: "bg-muted text-foreground hover:opacity-90",
  };

  return (
    <button className={cn(base, variants[variant], className)} disabled={disabled} {...props} />
  );
}
