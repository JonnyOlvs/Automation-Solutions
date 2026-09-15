import { Router } from "express";
import { store } from "../../data/store";

export const reportsRouter = Router();

reportsRouter.get("/", (req, res) => {
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;

  const reports = store
    .getReports({ clientId, projectId })
    .map((report) => ({ ...report, execution: store.getExecutionById(report.executionId) }))
    .sort((a, b) => new Date(b.execution?.date ?? 0).getTime() - new Date(a.execution?.date ?? 0).getTime());

  res.json(reports);
});
