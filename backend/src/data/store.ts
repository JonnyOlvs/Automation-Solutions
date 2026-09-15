import path from "path";
import { FileRepository } from "../lib/repository";
import { scanPlaywrightEvidences } from "../lib/playwrightBridge";
import { getCachedCiScan } from "../lib/ciEvidenceBridge";
import {
  AutomationCoverage,
  Client,
  DocumentItem,
  Environment,
  Evidence,
  Execution,
  ExecutionFilters,
  Incident,
  Integration,
  Project,
  Report,
  Suite,
  TestCase,
  User
} from "../types";

const MOCK_DIR = path.join(__dirname, "mock");
const file = <T>(name: string) => new FileRepository<T>(path.join(MOCK_DIR, name));

const repos = {
  clients: file<Client>("clients.json"),
  projects: file<Project>("projects.json"),
  environments: file<Environment>("environments.json"),
  suites: file<Suite>("suites.json"),
  executionsMock: file<Execution>("executions.json"),
  testCases: file<TestCase>("testCases.json"),
  evidencesMock: file<Evidence>("evidences.json"),
  reportsMock: file<Report>("reports.json"),
  documents: file<DocumentItem>("documents.json"),
  users: file<User>("users.json"),
  integrations: file<Integration>("integrations.json"),
  incidents: file<Incident>("incidents.json"),
  automationCoverage: file<AutomationCoverage>("automationCoverage.json")
};

/** Quita duplicados por `id`, dando prioridad a las entradas mas recientes en la lista. */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}

/**
 * Combina 3 fuentes de ejecuciones/evidencias/reportes:
 *  - mock: datos simulados (backend/src/data/mock)
 *  - local: corridas reales de Playwright en disco (carpeta evidencias/, solo en local/dev)
 *  - ci (R2): corridas reales disparadas por GitHub Actions, subidas a Cloudflare R2
 *    (ver scripts/lib/r2Upload.cjs + backend/src/lib/ciEvidenceBridge.ts)
 */
function getAllExecutions(): Execution[] {
  const local = scanPlaywrightEvidences();
  const ci = getCachedCiScan();
  return dedupeById([...repos.executionsMock.findAll(), ...local.executions, ...ci.executions]);
}

function getAllEvidences(): Evidence[] {
  const local = scanPlaywrightEvidences();
  const ci = getCachedCiScan();
  return dedupeById([...repos.evidencesMock.findAll(), ...local.evidences, ...ci.evidences]);
}

function getAllReports(): Report[] {
  const local = scanPlaywrightEvidences();
  const ci = getCachedCiScan();
  return dedupeById([...repos.reportsMock.findAll(), ...(local.reports as Report[]), ...(ci.reports as Report[])]);
}

function inRange(dateIso: string, from?: string, to?: string): boolean {
  const t = new Date(dateIso).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime()) return false;
  return true;
}

export function filterExecutions(filters: ExecutionFilters = {}): Execution[] {
  return getAllExecutions().filter((exec) => {
    if (filters.clientId && exec.clientId !== filters.clientId) return false;
    if (filters.projectId && exec.projectId !== filters.projectId) return false;
    if (filters.environmentId && exec.environmentId !== filters.environmentId) return false;
    if (filters.suiteId && exec.suiteId !== filters.suiteId) return false;
    if (filters.branch && exec.branch !== filters.branch) return false;
    if (filters.status && exec.status !== filters.status) return false;
    if (!inRange(exec.date, filters.dateFrom, filters.dateTo)) return false;
    return true;
  });
}

export const store = {
  getClients: (): Client[] => repos.clients.findAll(),
  getClientById: (id: string): Client | undefined => repos.clients.findAll().find((c) => c.id === id),

  getProjects: (clientId?: string): Project[] =>
    repos.projects.findAll().filter((p) => !clientId || p.clientId === clientId),
  getProjectById: (id: string): Project | undefined => repos.projects.findAll().find((p) => p.id === id),

  getEnvironments: (projectId?: string): Environment[] =>
    repos.environments.findAll().filter((e) => !projectId || e.projectId === projectId),

  getSuites: (projectId?: string): Suite[] =>
    repos.suites.findAll().filter((s) => !projectId || s.projectId === projectId),

  getExecutions: filterExecutions,
  getExecutionById: (id: string): Execution | undefined => getAllExecutions().find((e) => e.id === id),

  getTestCases: (executionId?: string): TestCase[] =>
    repos.testCases.findAll().filter((tc) => !executionId || tc.executionId === executionId),
  getTestCaseById: (id: string): TestCase | undefined => repos.testCases.findAll().find((tc) => tc.id === id),

  getEvidences: (filters: { executionId?: string; testCaseId?: string } = {}): Evidence[] =>
    getAllEvidences().filter(
      (ev) =>
        (!filters.executionId || ev.executionId === filters.executionId) &&
        (!filters.testCaseId || ev.testCaseId === filters.testCaseId)
    ),

  getReports: (filters: { clientId?: string; projectId?: string; executionId?: string } = {}): Report[] =>
    getAllReports().filter(
      (r) =>
        (!filters.clientId || r.clientId === filters.clientId) &&
        (!filters.projectId || r.projectId === filters.projectId) &&
        (!filters.executionId || r.executionId === filters.executionId)
    ),

  getDocuments: (filters: { clientId?: string; projectId?: string } = {}): DocumentItem[] =>
    repos.documents
      .findAll()
      .filter(
        (d) => (!filters.clientId || d.clientId === filters.clientId) && (!filters.projectId || d.projectId === filters.projectId)
      ),

  getUsers: (): User[] => repos.users.findAll(),
  getUserById: (id: string): User | undefined => repos.users.findAll().find((u) => u.id === id),

  getIntegrations: (projectId?: string): Integration[] =>
    repos.integrations.findAll().filter((i) => !projectId || i.projectId === projectId),

  getIncidents: (filters: { clientId?: string; projectId?: string; status?: string } = {}): Incident[] =>
    repos.incidents
      .findAll()
      .filter(
        (i) =>
          (!filters.clientId || i.clientId === filters.clientId) &&
          (!filters.projectId || i.projectId === filters.projectId) &&
          (!filters.status || i.status === filters.status)
      ),

  getAutomationCoverage: (projectIds?: string[]): AutomationCoverage[] =>
    repos.automationCoverage.findAll().filter((c) => !projectIds || projectIds.includes(c.projectId))
};
