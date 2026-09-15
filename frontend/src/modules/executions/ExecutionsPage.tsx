import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlayCircle, GitBranch } from "lucide-react";
import { executionsApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ExecutionStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDuration } from "@/lib/utils";

export function ExecutionsPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: executions, isLoading } = useQuery({
    queryKey: ["executions", filters],
    queryFn: () => executionsApi.list(filters)
  });

  return (
    <div>
      <PageHeader
        title="Centro de Ejecuciones"
        description="Todas las corridas de automatización, mock y reales (Playwright), en un solo lugar."
      />

      {isLoading ? (
        <Skeleton className="h-[480px]" />
      ) : !executions?.length ? (
        <EmptyState icon={PlayCircle} title="Sin ejecuciones" description="No hay ejecuciones para los filtros seleccionados." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente / Proyecto</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Suite</TableHead>
              <TableHead>Branch / Commit</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>PASS</TableHead>
              <TableHead>FAIL</TableHead>
              <TableHead>SKIP</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.map((exec) => (
              <TableRow key={exec.id}>
                <TableCell>
                  <Link to={`/ejecuciones/${exec.id}`} className="font-mono text-xs text-brand-navy hover:underline">
                    {exec.id}
                  </Link>
                  {exec.source === "playwright" && (
                    <Badge variant="info" className="ml-1.5">
                      real
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  <p className="font-medium text-foreground">{exec.client?.name}</p>
                  <p className="text-xs text-muted-foreground">{exec.project?.name}</p>
                </TableCell>
                <TableCell className="text-xs uppercase text-muted-foreground">{exec.environment?.name}</TableCell>
                <TableCell className="text-sm">{exec.suite?.name}</TableCell>
                <TableCell className="text-xs">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {exec.branch}
                  </span>
                  <span className="font-mono text-muted-foreground">{exec.commit}</span>
                </TableCell>
                <TableCell className="text-xs">{formatDate(exec.date)}</TableCell>
                <TableCell className="text-xs">{formatDuration(exec.durationSeconds)}</TableCell>
                <TableCell className="text-sm font-medium">{exec.totals.total}</TableCell>
                <TableCell className="text-sm font-medium text-status-pass">{exec.totals.pass}</TableCell>
                <TableCell className="text-sm font-medium text-status-fail">{exec.totals.fail}</TableCell>
                <TableCell className="text-sm font-medium text-muted-foreground">{exec.totals.skipped}</TableCell>
                <TableCell>
                  <ExecutionStatusBadge status={exec.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
