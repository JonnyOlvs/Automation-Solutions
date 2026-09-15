import path from "path";
import { Evidence, Report } from "../types";
import { PROJECT_NAME_MAP, RawExecutionJson, rawExecutionToExecution, PlaywrightScanResult } from "./playwrightBridge";
import { isR2Configured, listKeys, getObjectText, toPublicUrl } from "./r2Client";

/**
 * Version "remota" de `playwrightBridge.scanPlaywrightEvidences`, pero leyendo
 * desde Cloudflare R2 en lugar del disco local: es lo que le permite al backend
 * desplegado (Render/Workers/etc, sin la carpeta `evidencias/` local) ver las
 * corridas que dispara GitHub Actions.
 *
 * Se corre en un poll periodico (ver `startCiEvidencePolling`) y expone un
 * getter sincrono (`getCachedCiScan`) para que `store.ts` no tenga que volverse
 * asincrono.
 */

const EVIDENCIAS_PREFIX = "evidencias/";
let cachedResult: PlaywrightScanResult = { executions: [], evidences: [], reports: [] };
let lastRefreshError: string | null = null;
let refreshing: Promise<void> | null = null;

function evidenceUrlFromKey(key: string): string {
  return toPublicUrl(key);
}

function classifyEvidence(key: string, relative: string, executionId: string, seq: number): Evidence | null {
  const parts = relative.split("/");
  const folder = parts[0];
  const fileName = parts[parts.length - 1];
  const typeByFolder: Record<string, Evidence["type"]> = {
    screenshots: "screenshot",
    videos: "video",
    trace: "trace",
    logs: "log"
  };
  const type = typeByFolder[folder];
  if (!type) return null;

  return {
    id: `ev-ci-${executionId}-${seq}`,
    executionId,
    testCaseId: null,
    type,
    name: fileName,
    url: evidenceUrlFromKey(key)
  };
}

async function scanOneExecution(executionJsonKey: string): Promise<{
  executions: PlaywrightScanResult["executions"];
  evidences: Evidence[];
  reports: Report[];
}> {
  const empty = { executions: [], evidences: [], reports: [] };
  const text = await getObjectText(executionJsonKey);
  if (!text) return empty;

  let raw: RawExecutionJson;
  try {
    raw = JSON.parse(text) as RawExecutionJson;
  } catch {
    return empty;
  }

  const mapping = PROJECT_NAME_MAP[raw.project];
  if (!mapping) return empty;

  const execution = rawExecutionToExecution(raw, mapping, "playwright");
  const executionPrefix = executionJsonKey.slice(0, executionJsonKey.length - "execution.json".length);
  const siblingKeys = await listKeys(executionPrefix);

  const evidences: Evidence[] = [];
  let seq = 0;
  for (const key of siblingKeys) {
    if (key === executionJsonKey) continue;
    const relative = key.slice(executionPrefix.length);
    if (relative.startsWith("report/") || relative.startsWith("allure-report/")) continue;
    const evidence = classifyEvidence(key, relative, raw.id, seq);
    if (evidence) {
      evidences.push(evidence);
      seq++;
    }
  }

  const reports: Report[] = [];
  const pwReportKey = siblingKeys.find((k) => k.endsWith("report/index.html"));
  if (pwReportKey) {
    reports.push({
      id: `rep-ci-${raw.id}-pw`,
      executionId: raw.id,
      clientId: mapping.clientId,
      projectId: mapping.projectId,
      type: "playwright",
      name: `Reporte Playwright - ${raw.id}`,
      url: evidenceUrlFromKey(pwReportKey)
    });
  }
  const allureReportKey = siblingKeys.find((k) => k.endsWith("allure-report/index.html"));
  if (allureReportKey) {
    reports.push({
      id: `rep-ci-${raw.id}-allure`,
      executionId: raw.id,
      clientId: mapping.clientId,
      projectId: mapping.projectId,
      type: "allure",
      name: `Reporte Allure - ${raw.id}`,
      url: evidenceUrlFromKey(allureReportKey)
    });
  }

  return { executions: [execution], evidences, reports };
}

async function refreshFromR2(): Promise<void> {
  const executionJsonKeys = (await listKeys(EVIDENCIAS_PREFIX)).filter((key) =>
    path.basename(key) === "execution.json"
  );

  const executions: PlaywrightScanResult["executions"] = [];
  const evidences: Evidence[] = [];
  const reports: PlaywrightScanResult["reports"] = [];

  for (const key of executionJsonKeys) {
    const scanned = await scanOneExecution(key);
    executions.push(...scanned.executions);
    evidences.push(...scanned.evidences);
    reports.push(...(scanned.reports as PlaywrightScanResult["reports"]));
  }

  cachedResult = { executions, evidences, reports };
}

export function getCachedCiScan(): PlaywrightScanResult {
  return cachedResult;
}

export function getCiEvidenceStatus(): { enabled: boolean; lastError: string | null; executionsCount: number } {
  return {
    enabled: isR2Configured(),
    lastError: lastRefreshError,
    executionsCount: cachedResult.executions.length
  };
}

/** Fuerza un refresco inmediato (ej. desde un endpoint manual de "refrescar"). */
export async function refreshCiEvidenceNow(): Promise<void> {
  if (!isR2Configured()) return;
  if (refreshing) {
    await refreshing;
    return;
  }
  refreshing = refreshFromR2()
    .then(() => {
      lastRefreshError = null;
    })
    .catch((err) => {
      lastRefreshError = err instanceof Error ? err.message : String(err);
      console.warn("[ci-evidence] Error refrescando evidencias desde R2:", lastRefreshError);
    })
    .finally(() => {
      refreshing = null;
    });
  await refreshing;
}

export function startCiEvidencePolling(): void {
  if (!isR2Configured()) {
    console.log("[ci-evidence] R2 no configurado, se omite el polling de evidencias de CI.");
    return;
  }
  const intervalMs = Number(process.env.CI_EVIDENCE_POLL_MS ?? 30000);
  console.log(`[ci-evidence] Polling de evidencias en R2 cada ${intervalMs}ms.`);
  void refreshCiEvidenceNow();
  setInterval(() => {
    void refreshCiEvidenceNow();
  }, intervalMs);
}
