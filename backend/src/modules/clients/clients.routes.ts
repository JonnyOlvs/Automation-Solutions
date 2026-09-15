import { Router } from "express";
import { store } from "../../data/store";

export const clientsRouter = Router();

function buildClientSummary(clientId: string) {
  const projects = store.getProjects(clientId);
  const executions = store.getExecutions({ clientId });
  const sorted = [...executions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last = sorted[0];
  const totals = executions.reduce(
    (acc, e) => ({ total: acc.total + e.totals.total, pass: acc.pass + e.totals.pass }),
    { total: 0, pass: 0 }
  );
  const coverage = store.getAutomationCoverage(projects.map((p) => p.id));
  const automated = coverage.reduce((s, c) => s + c.automatedCases, 0);

  return {
    projectsCount: projects.length,
    lastExecutionDate: last?.date ?? null,
    successRate: totals.total ? Math.round((totals.pass / totals.total) * 1000) / 10 : 0,
    automatedCases: automated
  };
}

clientsRouter.get("/", (_req, res) => {
  const clients = store.getClients().map((client) => ({ ...client, summary: buildClientSummary(client.id) }));
  res.json(clients);
});

clientsRouter.get("/:id", (req, res) => {
  const client = store.getClientById(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json({ ...client, summary: buildClientSummary(client.id) });
});

clientsRouter.get("/:id/projects", (req, res) => {
  const projects = store.getProjects(req.params.id);
  const enriched = projects.map((project) => buildProjectSummary(project.id, project));
  res.json(enriched);
});

export function buildProjectSummary(projectId: string, projectBase: ReturnType<typeof store.getProjects>[number]) {
  const executions = store.getExecutions({ projectId });
  const sorted = [...executions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last = sorted[0];
  const totals = executions.reduce(
    (acc, e) => ({ total: acc.total + e.totals.total, pass: acc.pass + e.totals.pass }),
    { total: 0, pass: 0 }
  );
  const [coverage] = store.getAutomationCoverage([projectId]);

  return {
    ...projectBase,
    stats: {
      totalTests: totals.total,
      successRate: totals.total ? Math.round((totals.pass / totals.total) * 1000) / 10 : 0,
      lastExecutionDate: last?.date ?? null,
      lastExecutionStatus: last?.status ?? null,
      automatedCases: coverage?.automatedCases ?? 0,
      manualCases: coverage?.manualCases ?? 0,
      pendingCases: coverage?.pendingCases ?? 0,
      evidencesCount: store.getEvidences({}).filter((ev) => executions.some((e) => e.id === ev.executionId)).length,
      reportsCount: store.getReports({ projectId }).length
    }
  };
}
