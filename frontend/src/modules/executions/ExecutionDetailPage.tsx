import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Camera, Clapperboard, FileText, Waypoints, FileBarChart } from "lucide-react";
import { executionsApi } from "@/api/endpoints";
import { toStaticUrl } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CaseStatusBadge, ExecutionStatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDate, formatDuration } from "@/lib/utils";
import { TestCase } from "@/api/types";

const EVIDENCE_ICON: Record<string, any> = {
  screenshot: Camera,
  video: Clapperboard,
  trace: Waypoints,
  log: FileText,
  report: FileBarChart
};

export function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);

  const { data: execution, isLoading } = useQuery({
    queryKey: ["execution", id],
    queryFn: () => executionsApi.getById(id!),
    enabled: !!id
  });

  if (isLoading || !execution) return <Skeleton className="h-96" />;

  const t = execution.totals;

  return (
    <div>
      <PageHeader
        title={`Ejecución ${execution.id}`}
        description={`${execution.client?.name} · ${execution.project?.name} · ${execution.suite?.name}`}
        breadcrumb={[{ label: "Ejecuciones", to: "/ejecuciones" }, { label: execution.id }]}
        actions={<ExecutionStatusBadge status={execution.status} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <MetricBox label="Total" value={t.total} />
        <MetricBox label="Exitosas" value={t.pass} tone="text-status-pass" />
        <MetricBox label="Fallidas" value={t.fail} tone="text-status-fail" />
        <MetricBox label="Omitidas" value={t.skipped} tone="text-status-neutral" />
        <MetricBox label="Bloqueadas" value={t.blocked} tone="text-status-warning" />
        <MetricBox label="Duración" value={formatDuration(execution.durationSeconds)} />
        <MetricBox label="Fecha" value={formatDate(execution.date).split(",")[0]} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoRow label="Ambiente" value={execution.environment?.name.toUpperCase()} />
        <InfoRow label="Branch" value={execution.branch} />
        <InfoRow label="Commit" value={execution.commit} mono />
        <InfoRow label="Browser" value={execution.browser} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Casos de prueba</CardTitle>
        </CardHeader>
        <CardContent>
          {execution.testCases?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Caso de prueba</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {execution.testCases.map((tc) => (
                  <TableRow key={tc.id} className="cursor-pointer" onClick={() => setSelectedCase(tc)}>
                    <TableCell className="font-mono text-xs text-brand-navy">{tc.code}</TableCell>
                    <TableCell className="text-sm">{tc.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tc.module}</TableCell>
                    <TableCell className="text-xs">{(tc.durationMs / 1000).toFixed(1)}s</TableCell>
                    <TableCell>
                      <CaseStatusBadge status={tc.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta ejecución real de Playwright no trae desglose por caso todavía (solo resultado global). Revisa las evidencias abajo.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidencias y reportes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {execution.evidences?.map((ev) => {
            const Icon = EVIDENCE_ICON[ev.type] ?? FileText;
            return (
              <a
                key={ev.id}
                href={toStaticUrl(ev.url)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted/50"
              >
                <Icon className="h-3.5 w-3.5 text-brand-navy" />
                {ev.name}
                <Badge variant="outline">{ev.type}</Badge>
              </a>
            );
          })}
          {execution.reports?.map((report) => (
            <a
              key={report.id}
              href={toStaticUrl(report.url)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted/50"
            >
              <FileBarChart className="h-3.5 w-3.5 text-brand-navy" />
              {report.name}
              <Badge variant="outline">{report.type}</Badge>
            </a>
          ))}
          {!execution.evidences?.length && !execution.reports?.length && (
            <p className="text-sm text-muted-foreground">Sin evidencias registradas para esta ejecución.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        {selectedCase && (
          <DialogContent>
            <DialogTitle>
              {selectedCase.code} · {selectedCase.title}
            </DialogTitle>
            <DialogDescription>Módulo: {selectedCase.module}</DialogDescription>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <CaseStatusBadge status={selectedCase.status} />
                <span className="text-sm text-muted-foreground">{(selectedCase.durationMs / 1000).toFixed(1)}s</span>
              </div>
              {selectedCase.errorMessage && (
                <div className="rounded-md bg-status-fail/10 p-3 text-sm text-status-fail">{selectedCase.errorMessage}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {(execution.evidences ?? [])
                  .filter((ev) => ev.testCaseId === selectedCase.id)
                  .map((ev) => {
                    const Icon = EVIDENCE_ICON[ev.type] ?? FileText;
                    return (
                      <a
                        key={ev.id}
                        href={toStaticUrl(ev.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted/50"
                      >
                        <Icon className="h-3.5 w-3.5 text-brand-navy" />
                        {ev.name}
                      </a>
                    );
                  })}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function MetricBox({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <Card className="p-3 text-center">
      <p className={`text-xl font-bold ${tone ?? "text-brand-navy"}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <Card className="p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value ?? "—"}</p>
    </Card>
  );
}
