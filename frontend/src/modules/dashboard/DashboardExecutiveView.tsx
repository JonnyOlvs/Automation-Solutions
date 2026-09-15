import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, TrendingUp, Percent, Clock, Image as ImageIcon } from "lucide-react";
import { dashboardApi, executionsApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { ResultsDistributionChart, SuccessTrendChart, TopFailingModulesChart } from "@/components/charts/DashboardCharts";
import { Link } from "react-router-dom";

export function DashboardExecutiveView() {
  const filters = useAppStore((s) => s.filters);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary-exec", filters],
    queryFn: () => dashboardApi.summary(filters)
  });
  const { data: charts } = useQuery({
    queryKey: ["dashboard-charts-exec", filters],
    queryFn: () => dashboardApi.charts(filters)
  });
  const { data: recentExecutions } = useQuery({
    queryKey: ["executions-recent", filters],
    queryFn: () => executionsApi.list(filters)
  });

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const lastFive = (recentExecutions ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Pruebas ejecutadas" value={summary.testsExecuted} icon={CheckCircle2} tone="navy" />
        <KpiCard label="Exitosas" value={summary.passed} icon={CheckCircle2} tone="green" />
        <KpiCard label="Fallidas" value={summary.failed} icon={XCircle} tone="red" />
        <KpiCard label="Tasa de éxito" value={`${summary.successRate}%`} icon={TrendingUp} tone="green" />
        <KpiCard label="% Automatizado" value={`${summary.automationPercentage}%`} icon={Percent} tone="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo está el proyecto?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground">
            En el periodo seleccionado se ejecutaron <strong className="text-foreground">{summary.testsExecuted}</strong> pruebas,
            con una tasa de éxito de <strong className="text-status-pass">{summary.successRate}%</strong>. La última ejecución fue
            el <strong className="text-foreground">{formatDate(summary.lastExecutionDate)}</strong>.
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Duración promedio de ejecución: <strong className="text-foreground">{summary.avgDurationSeconds}s</strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {charts && <ResultsDistributionChart data={charts.resultsDistribution} />}
        {charts && <SuccessTrendChart data={charts.successTrend} />}
      </div>

      {charts && charts.topFailingModules.length > 0 && (
        <TopFailingModulesChart data={charts.topFailingModules} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Últimas ejecuciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {lastFive.map((exec) => (
            <Link
              key={exec.id}
              to={`/ejecuciones/${exec.id}`}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="font-medium text-foreground">
                  {exec.project?.name} · {exec.suite?.name}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(exec.date)}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-status-pass">{exec.totals.pass} PASS</span>
                <span className="text-status-fail">{exec.totals.fail} FAIL</span>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
