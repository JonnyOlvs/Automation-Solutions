import fs from "fs";
import path from "path";
import { Evidence, Execution } from "../types";

/**
 * Puente entre el framework Playwright (raiz del repo) y el dashboard.
 *
 * `scripts/run-with-evidences.cjs` ya escribe, en cada corrida real, una carpeta:
 *   evidencias/<proyecto>/<yyyy>/<mm>/<dd>/<execId>/
 *     execution.json, screenshots/, videos/, trace/, logs/, report/, allure-report/
 *
 * Este modulo escanea esa carpeta y convierte cada corrida real en una Execution
 * (source: "playwright") + sus Evidence, sin necesidad de una base de datos.
 *
 * Limitacion conocida: `execution.json` solo trae el resultado global de la corrida
 * (passed/failed), no el desglose por caso de prueba (para eso se necesitaria un
 * reporter JSON de Playwright). Por ahora se refleja como 1 "resultado" agregado;
 * cuando se agregue ese reporter, se puede enriquecer sin tocar el resto del backend.
 */

const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const EVIDENCIAS_DIR = path.join(REPO_ROOT, "evidencias");

// Mapea el nombre de "proyecto" usado por Playwright (AS_PROJECT) a un proyecto
// real del dashboard. Ajustar/ampliar cuando se agreguen mas suites AS_PROJECT.
const PROJECT_NAME_MAP: Record<string, { clientId: string; projectId: string; environmentId: string; suiteId: string }> = {
  Web: {
    clientId: "cli-alpha",
    projectId: "prj-alpha-ecommerce",
    environmentId: "env-1",
    suiteId: "suite-1"
  }
};

export interface RawExecutionJson {
  id: string;
  name: string;
  project: string;
  date: string;
  durationSeconds: number;
  status: "passed" | "failed";
  browser: string;
  user: string;
  branch?: string;
  commit?: string | null;
  ciWorkflowRunId?: string | null;
}

export function rawExecutionToExecution(
  raw: RawExecutionJson,
  mapping: { clientId: string; projectId: string; environmentId: string; suiteId: string },
  source: Execution["source"]
): Execution {
  const passed = raw.status === "passed";
  return {
    id: raw.id,
    clientId: mapping.clientId,
    projectId: mapping.projectId,
    environmentId: mapping.environmentId,
    suiteId: mapping.suiteId,
    branch: raw.branch || "main",
    commit: raw.commit || raw.id.replace("exec-", "").slice(0, 7),
    date: raw.date,
    durationSeconds: raw.durationSeconds,
    totals: {
      total: 1,
      pass: passed ? 1 : 0,
      fail: passed ? 0 : 1,
      skipped: 0,
      blocked: 0
    },
    status: passed ? "success" : "failed",
    browser: raw.browser,
    triggeredBy: raw.user,
    ciWorkflowRunId: raw.ciWorkflowRunId || undefined,
    source
  };
}

export { PROJECT_NAME_MAP };

function findExecutionJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop()!;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.name === "execution.json") {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function toEvidenceUrl(filePath: string): string {
  const relative = path.relative(EVIDENCIAS_DIR, filePath).split(path.sep).join("/");
  return `/static/evidencias/${relative}`;
}

function collectEvidenceFiles(executionDir: string, executionId: string): Evidence[] {
  const subfolders: Array<{ folder: string; type: Evidence["type"] }> = [
    { folder: "screenshots", type: "screenshot" },
    { folder: "videos", type: "video" },
    { folder: "trace", type: "trace" },
    { folder: "logs", type: "log" }
  ];
  const evidences: Evidence[] = [];
  let seq = 0;
  for (const { folder, type } of subfolders) {
    const dir = path.join(executionDir, folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile()) {
        evidences.push({
          id: `ev-pw-${executionId}-${seq++}`,
          executionId,
          testCaseId: null,
          type,
          name: file,
          url: toEvidenceUrl(fullPath)
        });
      }
    }
  }
  return evidences;
}

export interface PlaywrightScanResult {
  executions: Execution[];
  evidences: Evidence[];
  reports: Array<{ id: string; executionId: string; clientId: string; projectId: string; type: "playwright" | "allure"; name: string; url: string }>;
}

export function scanPlaywrightEvidences(): PlaywrightScanResult {
  const files = findExecutionJsonFiles(EVIDENCIAS_DIR);
  const executions: Execution[] = [];
  const evidences: Evidence[] = [];
  const reports: PlaywrightScanResult["reports"] = [];

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as RawExecutionJson;
      const mapping = PROJECT_NAME_MAP[raw.project];
      if (!mapping) continue;

      const executionDir = path.dirname(file);

      executions.push(rawExecutionToExecution(raw, mapping, "playwright"));

      evidences.push(...collectEvidenceFiles(executionDir, raw.id));

      const reportIndex = path.join(executionDir, "report", "index.html");
      if (fs.existsSync(reportIndex)) {
        reports.push({
          id: `rep-pw-${raw.id}-pw`,
          executionId: raw.id,
          clientId: mapping.clientId,
          projectId: mapping.projectId,
          type: "playwright",
          name: `Reporte Playwright - ${raw.id}`,
          url: toEvidenceUrl(reportIndex)
        });
      }

      const allureIndex = path.join(executionDir, "allure-report", "index.html");
      if (fs.existsSync(allureIndex)) {
        reports.push({
          id: `rep-pw-${raw.id}-allure`,
          executionId: raw.id,
          clientId: mapping.clientId,
          projectId: mapping.projectId,
          type: "allure",
          name: `Reporte Allure - ${raw.id}`,
          url: toEvidenceUrl(allureIndex)
        });
      }
    } catch {
      // Carpeta de evidencia incompleta o corrupta: se ignora silenciosamente.
    }
  }

  return { executions, evidences, reports };
}

export const EVIDENCIAS_STATIC_ROOT = EVIDENCIAS_DIR;
