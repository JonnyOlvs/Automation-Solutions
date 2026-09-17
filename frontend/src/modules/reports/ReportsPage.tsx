import { useQuery } from "@tanstack/react-query";
import { FileBarChart, ExternalLink } from "lucide-react";
import { reportsApi } from "@/api/endpoints";
import { toStaticUrl } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDuration } from "@/lib/utils";

export function ReportsPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports", filters.clientId, filters.projectId],
    queryFn: () => reportsApi.list(filters.clientId, filters.projectId)
  });

  return (
    <div>
      <PageHeader title="Reportes" description="Reportes de ejecución generados por Playwright y Allure." />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !reports?.length ? (
        <EmptyState icon={FileBarChart} title="Sin reportes" description="No hay reportes para el filtro seleccionado." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Ejecución</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="text-sm">{formatDate(report.execution?.date)}</TableCell>
                <TableCell className="text-sm">{report.execution?.project?.name}</TableCell>
                <TableCell className="font-mono text-xs">{report.executionId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.type}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {report.execution && (
                    <span className="text-status-pass">{report.execution.totals.pass}P</span>
                  )}{" "}
                  {report.execution && <span className="text-status-fail">{report.execution.totals.fail}F</span>}
                </TableCell>
                <TableCell className="text-sm">{formatDuration(report.execution?.durationSeconds)}</TableCell>
                <TableCell>
                  <a href={toStaticUrl(report.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-green hover:underline">
                    Abrir <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
