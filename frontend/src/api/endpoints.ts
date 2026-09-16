import { apiClient } from "./client";
import {
  Client,
  DashboardCharts,
  DashboardSummary,
  DocumentItem,
  Evidence,
  Execution,
  ExecutionFilters,
  FilterOptions,
  Integration,
  Project,
  Report,
  SessionUser,
  TestCase,
  User
} from "./types";

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (!entries.length) return "";
  return `?${new URLSearchParams(entries as [string, string][]).toString()}`;
}

export const clientsApi = {
  list: async (): Promise<Client[]> => (await apiClient.get("/clients")).data,
  getById: async (id: string): Promise<Client> => (await apiClient.get(`/clients/${id}`)).data,
  projects: async (id: string): Promise<Project[]> => (await apiClient.get(`/clients/${id}/projects`)).data
};

export const projectsApi = {
  list: async (clientId?: string): Promise<Project[]> => (await apiClient.get(`/projects${qs({ clientId })}`)).data,
  getById: async (id: string): Promise<Project> => (await apiClient.get(`/projects/${id}`)).data
};

export const executionsApi = {
  list: async (filters: ExecutionFilters = {}): Promise<Execution[]> =>
    (
      await apiClient.get(
        `/executions${qs({
          clientId: filters.clientId,
          projectId: filters.projectId,
          environmentId: filters.environmentId,
          suiteId: filters.suiteId,
          branch: filters.branch,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        })}`
      )
    ).data,
  getById: async (id: string): Promise<Execution> => (await apiClient.get(`/executions/${id}`)).data,
  getTestCase: async (executionId: string, caseId: string): Promise<TestCase> =>
    (await apiClient.get(`/executions/${executionId}/testcases/${caseId}`)).data
};

export const evidencesApi = {
  tree: async (clientId?: string, projectId?: string): Promise<any[]> =>
    (await apiClient.get(`/evidences/tree${qs({ clientId, projectId })}`)).data,
  list: async (executionId?: string, testCaseId?: string): Promise<Evidence[]> =>
    (await apiClient.get(`/evidences${qs({ executionId, testCaseId })}`)).data
};

export const reportsApi = {
  list: async (clientId?: string, projectId?: string): Promise<Report[]> =>
    (await apiClient.get(`/reports${qs({ clientId, projectId })}`)).data
};

export const documentsApi = {
  list: async (clientId?: string, projectId?: string): Promise<DocumentItem[]> =>
    (await apiClient.get(`/documents${qs({ clientId, projectId })}`)).data
};

export const integrationsApi = {
  list: async (projectId?: string): Promise<Integration[]> => (await apiClient.get(`/integrations${qs({ projectId })}`)).data
};

export const dashboardApi = {
  summary: async (filters: ExecutionFilters = {}): Promise<DashboardSummary> =>
    (
      await apiClient.get(
        `/dashboard/summary${qs({
          clientId: filters.clientId,
          projectId: filters.projectId,
          environmentId: filters.environmentId,
          suiteId: filters.suiteId,
          branch: filters.branch,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        })}`
      )
    ).data,
  charts: async (filters: ExecutionFilters = {}): Promise<DashboardCharts> =>
    (
      await apiClient.get(
        `/dashboard/charts${qs({
          clientId: filters.clientId,
          projectId: filters.projectId,
          environmentId: filters.environmentId,
          suiteId: filters.suiteId,
          branch: filters.branch,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        })}`
      )
    ).data
};

export const filtersApi = {
  options: async (clientId?: string, projectId?: string): Promise<FilterOptions> =>
    (await apiClient.get(`/filters/options${qs({ clientId, projectId })}`)).data
};

export const authApi = {
  users: async (): Promise<User[]> => (await apiClient.get("/auth/users")).data,
  login: async (email: string, password: string): Promise<{ token: string; user: SessionUser }> =>
    (await apiClient.post("/auth/login", { email, password })).data,
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
  me: async (): Promise<SessionUser> => (await apiClient.get("/auth/me")).data
};
