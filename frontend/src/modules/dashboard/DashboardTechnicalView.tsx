import { useQuery } from "@tanstack/react-query";
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  Ban,
  MinusCircle,
  Percent,
  TrendingUp,
  TrendingDown,
  Timer,
  Clock,
  CalendarDays,
  CalendarRange,
  Calendar,
  AlertOctagon,
  FolderCheck,
  Workflow
} from "lucide-react";
import { dashboardApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import {
  AutomationBreakdownChart,
  DurationTrendChart,
  ExecutionsPerDayChart,
  ResultsDistributionChart,
  SuccessTrendChart,
  TopFailingModulesChart
} from "@/components/charts/DashboardCharts";

export function DashboardTechnicalView() {
  const filters = useAppStore((s) => s.filters);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary", filters],
    queryFn: () => dashboardApi.summary(filters)
  });

  const { data: charts, isLoading: loadingCharts } = useQuery({
    queryKey: ["dashboard-charts", filters],
    queryFn: () => dashboardApi.charts(filters)
  });

  if (loadingSummary || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resultados</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Pruebas ejecutadas" value={summary.testsExecuted} icon={ListChecks} tone="navy" />
          <KpiCard label="Exitosas" value={summary.passed} icon={CheckCircle2} tone="green" />
          <KpiCard label="Fallidas" value={summary.failed} icon={XCircle} tone="red" />
          <KpiCard label="Bloqueadas" value={summary.blocked} icon={Ban} tone="yellow" />
          <KpiCard label="Omitidas" value={summary.skipped} icon={MinusCircle} tone="gray" />
          <KpiCard label="Tasa de éxito" value={`${summary.successRate}%`} icon={TrendingUp} tone="green" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automatización</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Casos automatizados" value={summary.totalAutomatedTests} icon={FolderCheck} tone="green" />
          <KpiCard label="% de automatización" value={`${summary.automationPercentage}%`} icon={Percent} tone="blue" />
          <KpiCard label="Pendientes por automatizar" value={summary.pendingToAutomate} icon={Workflow} tone="gray" />
          <KpiCard label="Tasa de fallo" value={`${summary.failRate}%`} icon={TrendingDown} tone="red" />
          <KpiCard label="Duración promedio" value={formatDuration(summary.avgDurationSeconds)} icon={Timer} tone="navy" />
          <KpiCard label="Última ejecución" value={formatDuration(summary.lastExecutionDurationSeconds)} icon={Clock} tone="navy" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ejecuciones e incidencias</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Ejecuciones hoy" value={summary.executionsToday} icon={Calendar} tone="navy" />
          <KpiCard label="Ejecuciones semana" value={summary.executionsWeek} icon={CalendarDays} tone="navy" />
          <KpiCard label="Ejecuciones mes" value={summary.executionsMonth} icon={CalendarRange} tone="navy" />
          <KpiCard label="Incidencias detectadas" value={summary.incidentsDetected} icon={AlertOctagon} tone="yellow" />
          <KpiCard label="Incidencias abiertas" value={summary.incidentsOpen} icon={AlertOctagon} tone="red" />
          <KpiCard label="Incidencias cerradas" value={summary.incidentsClosed} icon={CheckCircle2} tone="green" />
        </div>
      </section>

      {!loadingCharts && charts && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gráficas</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <ExecutionsPerDayChart data={charts.executionsPerDay} />
            <ResultsDistributionChart data={charts.resultsDistribution} />
            <SuccessTrendChart data={charts.successTrend} />
            <AutomationBreakdownChart data={charts.automationBreakdown} />
            <DurationTrendChart data={charts.durationTrend} />
            <TopFailingModulesChart data={charts.topFailingModules} />
          </div>
        </section>
      )}
    </div>
  );
}
