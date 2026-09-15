import { store } from "../../data/store";
import { ExecutionFilters, Execution, TestCase } from "../../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function getSummary(filters: ExecutionFilters) {
  const executions = store.getExecutions(filters);
  const now = new Date();
  const today = startOfDay(now).getTime();
  const weekAgo = today - 7 * DAY_MS;
  const monthAgo = today - 30 * DAY_MS;

  const totals = executions.reduce(
    (acc, e) => {
      acc.total += e.totals.total;
      acc.pass += e.totals.pass;
      acc.fail += e.totals.fail;
      acc.skipped += e.totals.skipped;
      acc.blocked += e.totals.blocked;
      acc.duration += e.durationSeconds;
      return acc;
    },
    { total: 0, pass: 0, fail: 0, skipped: 0, blocked: 0, duration: 0 }
  );

  const sorted = [...executions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last = sorted[0];

  const executionsToday = executions.filter((e) => new Date(e.date).getTime() >= today).length;
  const executionsWeek = executions.filter((e) => new Date(e.date).getTime() >= weekAgo).length;
  const executionsMonth = executions.filter((e) => new Date(e.date).getTime() >= monthAgo).length;

  const projectIds = Array.from(new Set(executions.map((e) => e.projectId)));
  const coverage = store.getAutomationCoverage(filters.projectId ? [filters.projectId] : projectIds);
  const automation = coverage.reduce(
    (acc, c) => {
      acc.automated += c.automatedCases;
      acc.manual += c.manualCases;
      acc.pending += c.pendingCases;
      return acc;
    },
    { automated: 0, manual: 0, pending: 0 }
  );
  const automationTotal = automation.automated + automation.manual + automation.pending;

  const incidents = store.getIncidents({ clientId: filters.clientId, projectId: filters.projectId });

  return {
    totalAutomatedTests: automation.automated,
    testsExecuted: totals.total,
    passed: totals.pass,
    failed: totals.fail,
    blocked: totals.blocked,
    skipped: totals.skipped,
    automationPercentage: pct(automation.automated, automationTotal),
    successRate: pct(totals.pass, totals.total),
    failRate: pct(totals.fail, totals.total),
    avgDurationSeconds: executions.length ? Math.round(totals.duration / executions.length) : 0,
    lastExecutionDurationSeconds: last?.durationSeconds ?? 0,
    lastExecutionDate: last?.date ?? null,
    executionsToday,
    executionsWeek,
    executionsMonth,
    incidentsDetected: incidents.length,
    incidentsOpen: incidents.filter((i) => i.status === "open").length,
    incidentsClosed: incidents.filter((i) => i.status === "closed").length,
    automatedFlows: automation.automated,
    pendingToAutomate: automation.pending
  };
}

export function getCharts(filters: ExecutionFilters) {
  const executions = store.getExecutions(filters);
  const byDate = new Map<string, Execution[]>();
  for (const e of executions) {
    const key = e.date.slice(0, 10);
    byDate.set(key, [...(byDate.get(key) ?? []), e]);
  }
  const sortedDates = Array.from(byDate.keys()).sort();

  const executionsPerDay = sortedDates.map((date) => ({ date, count: byDate.get(date)!.length }));

  const successTrend = sortedDates.map((date) => {
    const dayExecs = byDate.get(date)!;
    const total = dayExecs.reduce((s, e) => s + e.totals.total, 0);
    const pass = dayExecs.reduce((s, e) => s + e.totals.pass, 0);
    return { date, successRate: pct(pass, total) };
  });

  const durationTrend = sortedDates.map((date) => {
    const dayExecs = byDate.get(date)!;
    const avg = dayExecs.reduce((s, e) => s + e.durationSeconds, 0) / dayExecs.length;
    return { date, avgDurationSeconds: Math.round(avg) };
  });

  const resultsDistribution = executions.reduce(
    (acc, e) => {
      acc.PASS += e.totals.pass;
      acc.FAIL += e.totals.fail;
      acc.SKIPPED += e.totals.skipped;
      acc.BLOCKED += e.totals.blocked;
      return acc;
    },
    { PASS: 0, FAIL: 0, SKIPPED: 0, BLOCKED: 0 }
  );

  const projectIds = Array.from(new Set(executions.map((e) => e.projectId)));
  const coverage = store.getAutomationCoverage(filters.projectId ? [filters.projectId] : projectIds);
  const automationBreakdown = coverage.reduce(
    (acc, c) => {
      acc.automated += c.automatedCases;
      acc.manual += c.manualCases;
      acc.pending += c.pendingCases;
      return acc;
    },
    { automated: 0, manual: 0, pending: 0 }
  );

  const executionIds = new Set(executions.map((e) => e.id));
  const testCases: TestCase[] = store
    .getTestCases()
    .filter((tc) => executionIds.has(tc.executionId) && tc.status === "FAIL");
  const failuresByModule = new Map<string, number>();
  for (const tc of testCases) {
    failuresByModule.set(tc.module, (failuresByModule.get(tc.module) ?? 0) + 1);
  }
  const topFailingModules = Array.from(failuresByModule.entries())
    .map(([module, failures]) => ({ module, failures }))
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 8);

  return {
    executionsPerDay,
    resultsDistribution,
    successTrend,
    durationTrend,
    automationBreakdown,
    topFailingModules
  };
}
