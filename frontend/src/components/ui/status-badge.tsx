import { CheckCircle2, XCircle, MinusCircle, AlertTriangle, Loader2, Ban } from "lucide-react";
import { Badge } from "./badge";

const CASE_STATUS_MAP: Record<string, { label: string; variant: "pass" | "fail" | "warning" | "neutral"; icon: any }> = {
  PASS: { label: "PASS", variant: "pass", icon: CheckCircle2 },
  FAIL: { label: "FAIL", variant: "fail", icon: XCircle },
  SKIPPED: { label: "SKIPPED", variant: "neutral", icon: MinusCircle },
  BLOCKED: { label: "BLOCKED", variant: "warning", icon: Ban }
};

const EXECUTION_STATUS_MAP: Record<string, { label: string; variant: "pass" | "fail" | "warning" | "neutral" | "info"; icon: any }> = {
  success: { label: "Exitoso", variant: "pass", icon: CheckCircle2 },
  failed: { label: "Fallido", variant: "fail", icon: XCircle },
  running: { label: "Ejecutando", variant: "info", icon: Loader2 },
  cancelled: { label: "Cancelado", variant: "neutral", icon: MinusCircle },
  error: { label: "Error", variant: "warning", icon: AlertTriangle }
};

export function CaseStatusBadge({ status }: { status: string }) {
  const cfg = CASE_STATUS_MAP[status] ?? CASE_STATUS_MAP.SKIPPED;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </Badge>
  );
}

export function ExecutionStatusBadge({ status }: { status: string }) {
  const cfg = EXECUTION_STATUS_MAP[status] ?? EXECUTION_STATUS_MAP.running;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant}>
      <Icon className={`h-3.5 w-3.5 ${status === "running" ? "animate-spin" : ""}`} />
      {cfg.label}
    </Badge>
  );
}
