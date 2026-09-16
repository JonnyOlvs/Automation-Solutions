import { Router } from "express";
import { store } from "../../data/store";
import { parseExecutionFilters } from "../../lib/queryFilters";
import { assertClientOwnership } from "../../lib/auth";

export const executionsRouter = Router();

function enrich(execution: ReturnType<typeof store.getExecutionById>) {
  if (!execution) return null;
  return {
    ...execution,
    client: store.getClientById(execution.clientId),
    project: store.getProjectById(execution.projectId),
    environment: store.getEnvironments(execution.projectId).find((e) => e.id === execution.environmentId),
    suite: store.getSuites(execution.projectId).find((s) => s.id === execution.suiteId)
  };
}

executionsRouter.get("/", (req, res) => {
  const filters = parseExecutionFilters(req);
  const executions = store
    .getExecutions(filters)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((execution) => enrich(execution));
  res.json(executions);
});

executionsRouter.get("/:id", (req, res) => {
  const execution = store.getExecutionById(req.params.id);
  if (!execution) return res.status(404).json({ message: "Ejecucion no encontrada" });
  if (!assertClientOwnership(req, res, execution.clientId)) return;

  const testCases = store.getTestCases(execution.id);
  const evidences = store.getEvidences({ executionId: execution.id });
  const reports = store.getReports({ executionId: execution.id });

  res.json({
    ...enrich(execution),
    testCases,
    evidences,
    reports
  });
});

executionsRouter.get("/:id/testcases/:caseId", (req, res) => {
  const testCase = store.getTestCaseById(req.params.caseId);
  if (!testCase || testCase.executionId !== req.params.id) {
    return res.status(404).json({ message: "Caso de prueba no encontrado" });
  }
  const parentExecution = store.getExecutionById(testCase.executionId);
  if (!assertClientOwnership(req, res, parentExecution?.clientId)) return;
  const evidences = store.getEvidences({ testCaseId: testCase.id });
  res.json({ ...testCase, evidences });
});
