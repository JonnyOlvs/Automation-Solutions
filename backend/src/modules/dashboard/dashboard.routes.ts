import { Router } from "express";
import { parseExecutionFilters } from "../../lib/queryFilters";
import { getCharts, getSummary } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", (req, res) => {
  res.json(getSummary(parseExecutionFilters(req)));
});

dashboardRouter.get("/charts", (req, res) => {
  res.json(getCharts(parseExecutionFilters(req)));
});
