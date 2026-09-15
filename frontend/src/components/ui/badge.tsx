import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-navy text-white",
        pass: "border-transparent bg-status-pass/10 text-status-pass",
        fail: "border-transparent bg-status-fail/10 text-status-fail",
        warning: "border-transparent bg-status-warning/10 text-status-warning",
        info: "border-transparent bg-status-info/10 text-status-info",
        neutral: "border-transparent bg-status-neutral/10 text-status-neutral",
        outline: "border-border text-foreground"
      }
    },
    defaultVariants: { variant: "default" }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
