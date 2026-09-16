export type ExecutionStatus = "running" | "success" | "failed" | "cancelled" | "error";
export type CaseStatus = "PASS" | "FAIL" | "SKIPPED" | "BLOCKED";
export type EvidenceType = "screenshot" | "video" | "trace" | "log" | "html" | "json" | "xml" | "report";
export type ReportType = "playwright" | "allure" | "executive";
export type UserRole = "admin" | "qa_lead" | "qa_automation" | "qa_manual" | "client";
export type ExecutionSource = "mock" | "playwright";

export interface Client {
  id: string;
  name: string;
  slug: string;
  industry: string;
  status: "active" | "inactive";
  contactEmail: string;
  createdAt: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: string;
  status: "active" | "paused" | "completed";
  repoFullName?: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  baseUrl: string;
}

export interface Suite {
  id: string;
  projectId: string;
  name: string;
  type: string;
}

export interface ExecutionTotals {
  total: number;
  pass: number;
  fail: number;
  skipped: number;
  blocked: number;
}

export interface Execution {
  id: string;
  clientId: string;
  projectId: string;
  environmentId: string;
  suiteId: string;
  branch: string;
  commit: string;
  date: string;
  durationSeconds: number;
  totals: ExecutionTotals;
  status: ExecutionStatus;
  browser: string;
  triggeredBy: string;
  ciWorkflowRunId?: string;
  source: ExecutionSource;
}

export interface TestCase {
  id: string;
  executionId: string;
  code: string;
  title: string;
  module: string;
  status: CaseStatus;
  durationMs: number;
  errorMessage?: string | null;
}

export interface Evidence {
  id: string;
  executionId: string;
  testCaseId?: string | null;
  type: EvidenceType;
  name: string;
  url: string;
}

export interface Report {
  id: string;
  executionId: string;
  clientId: string;
  projectId: string;
  type: ReportType;
  name: string;
  url: string;
}

export interface DocumentItem {
  id: string;
  clientId: string;
  projectId: string;
  category: string;
  title: string;
  url: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}

export interface GithubWorkflowRun {
  id: string;
  workflow: string;
  status: "success" | "failure" | "in_progress" | "cancelled";
  branch: string;
  actor: string;
}

export interface Integration {
  id: string;
  projectId: string;
  provider: "github";
  repoFullName: string;
  defaultBranch: string;
  connected: boolean;
  lastSyncAt: string;
  lastWorkflowRun: GithubWorkflowRun;
}

export interface Incident {
  id: string;
  clientId: string;
  projectId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "closed";
  createdAt: string;
  closedAt: string | null;
}

export interface AutomationCoverage {
  id: string;
  projectId: string;
  automatedCases: number;
  manualCases: number;
  pendingCases: number;
  updatedAt: string;
}

export interface ExecutionFilters {
  clientId?: string;
  projectId?: string;
  environmentId?: string;
  suiteId?: string;
  branch?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
