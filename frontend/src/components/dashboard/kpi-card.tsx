import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type KpiTone = "navy" | "green" | "red" | "yellow" | "blue" | "gray";

const TONE_STYLES: Record<KpiTone, { bg: string; text: string; iconBg: string }> = {
  navy: { bg: "bg-brand-navy/5", text: "text-brand-navy", iconBg: "bg-brand-navy text-white" },
  green: { bg: "bg-status-pass/5", text: "text-status-pass", iconBg: "bg-status-pass text-white" },
  red: { bg: "bg-status-fail/5", text: "text-status-fail", iconBg: "bg-status-fail text-white" },
  yellow: { bg: "bg-status-warning/5", text: "text-status-warning", iconBg: "bg-status-warning text-white" },
  blue: { bg: "bg-status-info/5", text: "text-status-info", iconBg: "bg-status-info text-white" },
  gray: { bg: "bg-status-neutral/5", text: "text-status-neutral", iconBg: "bg-status-neutral text-white" }
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "navy",
  hint
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: KpiTone;
  hint?: string;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <Card className={cn("flex items-center gap-3 border-none p-4", styles.bg)}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", styles.iconBg)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-bold leading-tight", styles.text)}>{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
