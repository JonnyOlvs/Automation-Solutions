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
import { authRouter } from "../modules/auth/auth.routes";

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
apiRouter.use("/auth", authRouter);
