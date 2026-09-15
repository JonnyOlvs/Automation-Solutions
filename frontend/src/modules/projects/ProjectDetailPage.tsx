import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Github, Server, ListChecks, FileBarChart, BookOpen } from "lucide-react";
import { projectsApi, executionsApi, documentsApi, reportsApi } from "@/api/endpoints";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExecutionStatusBadge } from "@/components/ui/status-badge";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, formatDuration } from "@/lib/utils";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const setFilter = useAppStore((s) => s.setFilter);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id
  });
  const { data: executions } = useQuery({
    queryKey: ["project-executions", id],
    queryFn: () => executionsApi.list({ projectId: id }),
    enabled: !!id
  });
  const { data: documents } = useQuery({
    queryKey: ["project-documents", id],
    queryFn: () => documentsApi.list(undefined, id),
    enabled: !!id
  });
  const { data: reports } = useQuery({
    queryKey: ["project-reports", id],
    queryFn: () => reportsApi.list(undefined, id),
    enabled: !!id
  });

  useEffect(() => {
    if (project) {
      setFilter("clientId", project.clientId);
      setFilter("projectId", project.id);
    }
  }, [project, setFilter]);

  if (isLoading || !project) return <Skeleton className="h-96" />;

  const totalCases = (project.stats?.automatedCases ?? 0) + (project.stats?.manualCases ?? 0) + (project.stats?.pendingCases ?? 0);

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.client?.name}
        breadcrumb={[
          { label: "Clientes", to: "/clientes" },
          { label: project.client?.name ?? "", to: `/clientes/${project.clientId}` },
          { label: project.name }
        ]}
        actions={<Badge variant={project.status === "active" ? "pass" : "neutral"}>{project.status}</Badge>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pruebas totales</p>
          <p className="text-2xl font-bold text-brand-navy">{project.stats?.totalTests}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Tasa de éxito</p>
          <p className="text-2xl font-bold text-status-pass">{project.stats?.successRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Evidencias</p>
          <p className="text-2xl font-bold text-brand-navy">{project.stats?.evidencesCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Reportes</p>
          <p className="text-2xl font-bold text-brand-navy">{project.stats?.reportsCount}</p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" /> Ambientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.environments?.map((env) => (
              <div key={env.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span className="font-medium uppercase">{env.name}</span>
                <span className="truncate text-xs text-muted-foreground">{env.baseUrl}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Suites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.suites?.map((suite) => (
              <div key={suite.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span className="font-medium">{suite.name}</span>
                <Badge variant="outline">{suite.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cobertura de automatización</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={totalCases ? ((project.stats?.automatedCases ?? 0) / totalCases) * 100 : 0} className="h-3" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-semibold text-status-pass">{project.stats?.automatedCases}</p>
                <p className="text-muted-foreground">Automatizados</p>
              </div>
              <div>
                <p className="font-semibold text-status-info">{project.stats?.manualCases}</p>
                <p className="text-muted-foreground">Manuales</p>
              </div>
              <div>
                <p className="font-semibold text-status-warning">{project.stats?.pendingCases}</p>
                <p className="text-muted-foreground">Pendientes</p>
              </div>
            </div>
            {project.integration && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Github className="h-3.5 w-3.5" /> {project.integration.repoFullName}
                </span>
                <Badge variant={project.integration.connected ? "pass" : "neutral"}>
                  {project.integration.connected ? "Conectado" : "Sin conectar"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-navy">Ejecuciones recientes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Suite</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Resultados</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions?.slice(0, 10).map((exec) => (
              <TableRow key={exec.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/ejecuciones/${exec.id}`} className="text-brand-navy hover:underline">
                    {formatDate(exec.date)}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{exec.suite?.name}</TableCell>
                <TableCell className="text-sm">{exec.branch}</TableCell>
                <TableCell className="text-sm">{formatDuration(exec.durationSeconds)}</TableCell>
                <TableCell className="text-xs">
                  <span className="text-status-pass">{exec.totals.pass}P</span> · <span className="text-status-fail">{exec.totals.fail}F</span> ·{" "}
                  <span className="text-muted-foreground">{exec.totals.skipped}S</span>
                </TableCell>
                <TableCell>
                  <ExecutionStatusBadge status={exec.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Documentación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {documents?.map((doc) => (
              <a key={doc.id} href={doc.url} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                <span>{doc.title}</span>
                <Badge variant="outline">{doc.category}</Badge>
              </a>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" /> Reportes recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {reports?.slice(0, 8).map((report) => (
              <a
                key={report.id}
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
              >
                <span>{report.name}</span>
                <Badge variant="outline">{report.type}</Badge>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
