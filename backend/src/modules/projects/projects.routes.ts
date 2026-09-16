import { Router } from "express";
import { store } from "../../data/store";
import { buildProjectSummary } from "../clients/clients.routes";
import { assertClientOwnership } from "../../lib/auth";

export const projectsRouter = Router();

projectsRouter.get("/", (req, res) => {
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const projects = store.getProjects(clientId).map((p) => buildProjectSummary(p.id, p));
  res.json(projects);
});

projectsRouter.get("/:id", (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
  if (!assertClientOwnership(req, res, project.clientId)) return;

  const [coverage] = store.getAutomationCoverage([project.id]);
  const [integration] = store.getIntegrations(project.id);

  res.json({
    ...buildProjectSummary(project.id, project),
    client: store.getClientById(project.clientId),
    environments: store.getEnvironments(project.id),
    suites: store.getSuites(project.id),
    automationCoverage: coverage ?? null,
    integration: integration ?? null
  });
});
