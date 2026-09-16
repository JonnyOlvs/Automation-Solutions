import { Router } from "express";
import { store } from "../../data/store";
import { describeIntegrationStatus } from "./github.provider";
import { getCiEvidenceStatus, refreshCiEvidenceNow } from "../../lib/ciEvidenceBridge";

export const integrationsRouter = Router();

integrationsRouter.get("/", (req, res) => {
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const integrations = store
    .getIntegrations(projectId)
    .map((integration) => ({
      ...integration,
      project: store.getProjectById(integration.projectId),
      statusLabel: describeIntegrationStatus(integration)
    }))
    .filter((integration) => !clientId || integration.project?.clientId === clientId);
  res.json(integrations);
});

/** Estado de la conexion con las evidencias de CI almacenadas en Cloudflare R2. */
integrationsRouter.get("/ci-evidence/status", (_req, res) => {
  res.json(getCiEvidenceStatus());
});

/** Fuerza un refresco inmediato en lugar de esperar al siguiente ciclo de polling. */
integrationsRouter.post("/ci-evidence/refresh", async (_req, res) => {
  await refreshCiEvidenceNow();
  res.json(getCiEvidenceStatus());
});
