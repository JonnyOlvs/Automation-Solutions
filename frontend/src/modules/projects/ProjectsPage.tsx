import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { ExecutionStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

export function ProjectsPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", filters.clientId],
    queryFn: () => projectsApi.list(filters.clientId)
  });

  return (
    <div>
      <PageHeader title="Proyectos" description="Todos los proyectos automatizados en la plataforma." />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !projects?.length ? (
        <EmptyState icon={FolderKanban} title="Sin proyectos" description="No hay proyectos para el filtro seleccionado." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Automatización</TableHead>
              <TableHead>Última ejecución</TableHead>
              <TableHead>Éxito</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const cov = project.stats;
              const total = (cov?.automatedCases ?? 0) + (cov?.manualCases ?? 0) + (cov?.pendingCases ?? 0);
              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link to={`/proyectos/${project.id}`} className="font-medium text-brand-navy hover:underline">
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{project.type}</p>
                  </TableCell>
                  <TableCell className="text-sm">{project.client?.name}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === "active" ? "pass" : project.status === "paused" ? "warning" : "neutral"}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <Progress value={total ? ((cov?.automatedCases ?? 0) / total) * 100 : 0} />
                    <p className="mt-1 text-xs text-muted-foreground">{cov?.automatedCases}/{total} casos</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {cov?.lastExecutionStatus ? <ExecutionStatusBadge status={cov.lastExecutionStatus} /> : "—"}
                    <p className="text-xs text-muted-foreground">{formatDate(cov?.lastExecutionDate)}</p>
                  </TableCell>
                  <TableCell className="font-semibold text-status-pass">{cov?.successRate}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
