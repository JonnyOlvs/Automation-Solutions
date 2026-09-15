import { useQuery } from "@tanstack/react-query";
import { dashboardApi, projectsApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  AutomationBreakdownChart,
  DurationTrendChart,
  SuccessTrendChart,
  TopFailingModulesChart
} from "@/components/charts/DashboardCharts";

export function MetricsPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: charts, isLoading } = useQuery({
    queryKey: ["metrics-charts", filters],
    queryFn: () => dashboardApi.charts(filters)
  });
  const { data: projects } = useQuery({
    queryKey: ["metrics-projects", filters.clientId],
    queryFn: () => projectsApi.list(filters.clientId)
  });

  return (
    <div>
      <PageHeader title="Métricas" description="Analítica comparativa de éxito, duración y automatización por proyecto." />

      {isLoading || !charts ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SuccessTrendChart data={charts.successTrend} />
          <DurationTrendChart data={charts.durationTrend} />
          <AutomationBreakdownChart data={charts.automationBreakdown} />
          <TopFailingModulesChart data={charts.topFailingModules} />
        </div>
      )}

      <h2 className="my-4 text-sm font-semibold text-brand-navy">Comparativo por proyecto</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tasa de éxito</TableHead>
            <TableHead>Automatización</TableHead>
            <TableHead>Pruebas totales</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects?.map((project) => {
            const total = (project.stats?.automatedCases ?? 0) + (project.stats?.manualCases ?? 0) + (project.stats?.pendingCases ?? 0);
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{project.client?.name}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <Progress value={project.stats?.successRate ?? 0} className="w-24" />
                    <span>{project.stats?.successRate}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {project.stats?.automatedCases}/{total}
                </TableCell>
                <TableCell className="text-sm">{project.stats?.totalTests}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
