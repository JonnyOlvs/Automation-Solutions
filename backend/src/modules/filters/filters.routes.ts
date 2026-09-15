import { Router } from "express";
import { store } from "../../data/store";

export const filtersRouter = Router();

/** Endpoint unico para poblar los filtros globales (TopBar) del frontend. */
filtersRouter.get("/options", (req, res) => {
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;

  const clients = store.getClients();
  const projects = store.getProjects(clientId);
  const environments = store.getEnvironments(projectId);
  const suites = store.getSuites(projectId);
  const executions = store.getExecutions({ clientId, projectId });

  const branches = Array.from(new Set(executions.map((e) => e.branch))).sort();
  const statuses = Array.from(new Set(executions.map((e) => e.status))).sort();

  res.json({ clients, projects, environments, suites, branches, statuses });
});
