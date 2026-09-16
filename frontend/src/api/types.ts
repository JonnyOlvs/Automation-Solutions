export type ExecutionStatus = "running" | "success" | "failed" | "cancelled" | "error";
export type CaseStatus = "PASS" | "FAIL" | "SKIPPED" | "BLOCKED";
export type EvidenceType = "screenshot" | "video" | "trace" | "log" | "html" | "json" | "xml" | "report";
export type ReportType = "playwright" | "allure" | "executive";
export type UserRole = "admin" | "qa_lead" | "qa_automation" | "qa_manual" | "client";

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
  summary?: {
    projectsCount: number;
    lastExecutionDate: string | null;
    successRate: number;
    automatedCases: number;
  };
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: string;
  status: "active" | "paused" | "completed";
  repoFullName?: string;
  client?: Client;
  stats?: {
    totalTests: number;
    successRate: number;
    lastExecutionDate: string | null;
    lastExecutionStatus: ExecutionStatus | null;
    automatedCases: number;
    manualCases: number;
    pendingCases: number;
    evidencesCount: number;
    reportsCount: number;
  };
  environments?: Environment[];
  suites?: Suite[];
  automationCoverage?: AutomationCoverage | null;
  integration?: Integration | null;
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

export interface AutomationCoverage {
  id: string;
  projectId: string;
  automatedCases: number;
  manualCases: number;
  pendingCases: number;
  updatedAt: string;
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
  source: "mock" | "playwright";
  client?: Client;
  project?: Project;
  environment?: Environment;
  suite?: Suite;
  testCases?: TestCase[];
  evidences?: Evidence[];
  reports?: Report[];
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
  evidences?: Evidence[];
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
  execution?: Execution;
}

export interface DocumentItem {
  id: string;
  clientId: string;
  projectId: string;
  category: string;
  title: string;
  url: string;
  updatedAt: string;
  project?: Project;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}

/** Usuario de la sesion real (login), enriquecido con datos de branding del cliente si aplica. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string | null;
  client: { id: string; name: string; slug: string; logoUrl?: string; primaryColor?: string } | null;
}

export interface Integration {
  id: string;
  projectId: string;
  provider: "github";
  repoFullName: string;
  defaultBranch: string;
  connected: boolean;
  lastSyncAt: string;
  lastWorkflowRun: { id: string; workflow: string; status: string; branch: string; actor: string };
  project?: Project;
  statusLabel?: string;
}

export interface DashboardSummary {
  totalAutomatedTests: number;
  testsExecuted: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  automationPercentage: number;
  successRate: number;
  failRate: number;
  avgDurationSeconds: number;
  lastExecutionDurationSeconds: number;
  lastExecutionDate: string | null;
  executionsToday: number;
  executionsWeek: number;
  executionsMonth: number;
  incidentsDetected: number;
  incidentsOpen: number;
  incidentsClosed: number;
  automatedFlows: number;
  pendingToAutomate: number;
}

export interface DashboardCharts {
  executionsPerDay: Array<{ date: string; count: number }>;
  resultsDistribution: { PASS: number; FAIL: number; SKIPPED: number; BLOCKED: number };
  successTrend: Array<{ date: string; successRate: number }>;
  durationTrend: Array<{ date: string; avgDurationSeconds: number }>;
  automationBreakdown: { automated: number; manual: number; pending: number };
  topFailingModules: Array<{ module: string; failures: number }>;
}

export interface FilterOptions {
  clients: Client[];
  projects: Project[];
  environments: Environment[];
  suites: Suite[];
  branches: string[];
  statuses: string[];
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
