import { Router } from "express";
import { clientsRouter } from "../modules/clients/clients.routes";
import { projectsRouter } from "../modules/projects/projects.routes";
import { executionsRouter } from "../modules/executions/executions.routes";
import { evidencesRouter } from "../modules/evidences/evidences.routes";
import { reportsRouter } from "../modules/reports/reports.routes";
import { documentsRouter } from "../modules/documents/documents.routes";
import { integrationsRouter } from "../modules/integrations/integrations.routes";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes";
import { filtersRouter } from "../modules/filters/filters.routes";

// Nota: /api/auth (login/logout/me) se monta por separado en index.ts, ANTES
// del middleware requireAuth, porque el login no puede requerir una sesion
// que todavia no existe.
export const apiRouter = Router();

apiRouter.use("/clients", clientsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/executions", executionsRouter);
apiRouter.use("/evidences", evidencesRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/documents", documentsRouter);
apiRouter.use("/integrations", integrationsRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/filters", filtersRouter);
