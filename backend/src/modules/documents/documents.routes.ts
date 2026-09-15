import { Router } from "express";
import { store } from "../../data/store";

export const documentsRouter = Router();

documentsRouter.get("/", (req, res) => {
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const documents = store
    .getDocuments({ clientId, projectId })
    .map((doc) => ({ ...doc, project: store.getProjectById(doc.projectId) }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json(documents);
});
