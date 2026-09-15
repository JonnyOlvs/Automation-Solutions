import { Router } from "express";
import { store } from "../../data/store";

export const evidencesRouter = Router();

/**
 * Devuelve un arbol Cliente -> Proyecto -> Ejecucion -> Evidencias, filtrable
 * por clientId/projectId, para la seccion "Evidencias".
 */
evidencesRouter.get("/tree", (req, res) => {
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;

  const clients = store.getClients().filter((c) => !clientId || c.id === clientId);

  const tree = clients.map((client) => {
    const projects = store.getProjects(client.id).filter((p) => !projectId || p.id === projectId);
    return {
      client,
      projects: projects.map((project) => {
        const executions = store
          .getExecutions({ projectId: project.id })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 25);
        return {
          project,
          executions: executions.map((execution) => ({
            execution,
            evidences: store.getEvidences({ executionId: execution.id })
          }))
        };
      })
    };
  });

  res.json(tree);
});

evidencesRouter.get("/", (req, res) => {
  const executionId = typeof req.query.executionId === "string" ? req.query.executionId : undefined;
  const testCaseId = typeof req.query.testCaseId === "string" ? req.query.testCaseId : undefined;
  res.json(store.getEvidences({ executionId, testCaseId }));
});
