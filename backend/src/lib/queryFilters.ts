import { Request } from "express";
import { ExecutionFilters } from "../types";

const str = (v: unknown): string | undefined => (typeof v === "string" && v.length > 0 ? v : undefined);

export function parseExecutionFilters(req: Request): ExecutionFilters {
  const q = req.query;
  return {
    clientId: str(q.clientId),
    projectId: str(q.projectId),
    environmentId: str(q.environmentId),
    suiteId: str(q.suiteId),
    branch: str(q.branch),
    status: str(q.status),
    dateFrom: str(q.dateFrom),
    dateTo: str(q.dateTo)
  };
}
