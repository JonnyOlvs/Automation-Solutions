import { cn } from "@/lib/utils";

export function Progress({ value, className, colorClassName }: { value: number; className?: string; colorClassName?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full bg-brand-green transition-all", colorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
