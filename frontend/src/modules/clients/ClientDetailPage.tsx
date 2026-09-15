import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Mail, ArrowUpRight } from "lucide-react";
import { clientsApi } from "@/api/endpoints";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";
import { ExecutionStatusBadge } from "@/components/ui/status-badge";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const setFilter = useAppStore((s) => s.setFilter);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsApi.getById(id!),
    enabled: !!id
  });
  const { data: projects } = useQuery({
    queryKey: ["client-projects", id],
    queryFn: () => clientsApi.projects(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (id) setFilter("clientId", id);
  }, [id, setFilter]);

  if (isLoading || !client) return <Skeleton className="h-64" />;

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.industry}
        breadcrumb={[{ label: "Clientes", to: "/clientes" }, { label: client.name }]}
        actions={
          <Badge variant={client.status === "active" ? "pass" : "neutral"}>{client.status === "active" ? "Activo" : "Inactivo"}</Badge>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Proyectos</p>
          <p className="text-2xl font-bold text-brand-navy">{client.summary?.projectsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Tasa de éxito</p>
          <p className="text-2xl font-bold text-status-pass">{client.summary?.successRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Casos automatizados</p>
          <p className="text-2xl font-bold text-brand-navy">{client.summary?.automatedCases}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> Contacto
          </p>
          <p className="truncate text-sm font-medium text-foreground">{client.contactEmail}</p>
        </Card>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-navy">
        <FolderKanban className="h-4 w-4" /> Proyectos
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects?.map((project) => (
          <Link key={project.id} to={`/proyectos/${project.id}`}>
            <Card className="h-full transition-shadow hover:shadow-elevated">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base text-foreground">{project.name}</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado</span>
                  {project.stats?.lastExecutionStatus ? (
                    <ExecutionStatusBadge status={project.stats.lastExecutionStatus} />
                  ) : (
                    <Badge variant="neutral">Sin datos</Badge>
                  )}
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Automatización</span>
                    <span>
                      {project.stats?.automatedCases}/
                      {(project.stats?.automatedCases ?? 0) + (project.stats?.manualCases ?? 0) + (project.stats?.pendingCases ?? 0)}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((project.stats?.automatedCases ?? 0) /
                        Math.max(
                          1,
                          (project.stats?.automatedCases ?? 0) + (project.stats?.manualCases ?? 0) + (project.stats?.pendingCases ?? 0)
                        )) *
                      100
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-brand-navy">{project.stats?.totalTests}</p>
                    <p className="text-muted-foreground">Pruebas</p>
                  </div>
                  <div>
                    <p className="font-semibold text-status-pass">{project.stats?.successRate}%</p>
                    <p className="text-muted-foreground">Éxito</p>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{formatDate(project.stats?.lastExecutionDate).split(",")[0]}</p>
                    <p className="text-muted-foreground">Últ. corrida</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
