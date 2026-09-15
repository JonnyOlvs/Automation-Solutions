#!/usr/bin/env node
/**
 * Genera datos mock deterministicos (semilla fija) para la plataforma.
 * Simula clientes reales de QA Automation con proyectos, ambientes, suites,
 * ejecuciones, casos de prueba, evidencias, reportes, documentos, usuarios,
 * incidencias, cobertura de automatizacion e integraciones GitHub.
 *
 * Salida: backend/src/data/mock/*.json
 */
const fs = require("fs");
const path = require("path");

// RNG determinista (mulberry32) para que los datos sean estables entre corridas.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260825);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const isoDaysAgo = (days, hh, mm) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hh, mm, int(0, 59), 0);
  return d.toISOString();
};

const OUT_DIR = path.join(__dirname, "..", "src", "data", "mock");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------- Catalogo base ----------
const CLIENTS = [
  {
    id: "cli-alpha",
    name: "Cliente Alpha",
    slug: "alpha",
    industry: "Retail & E-commerce",
    status: "active",
    contactEmail: "qa-lead@alpharetail.com",
    createdAt: isoDaysAgo(210, 9, 0)
  },
  {
    id: "cli-beta",
    name: "Cliente Beta",
    slug: "beta",
    industry: "Manufactura",
    status: "active",
    contactEmail: "it@betamanufacturing.com",
    createdAt: isoDaysAgo(150, 9, 0)
  },
  {
    id: "cli-gamma",
    name: "Cliente Gamma",
    slug: "gamma",
    industry: "Marketplace",
    status: "active",
    contactEmail: "tech@gammamarket.com",
    createdAt: isoDaysAgo(90, 9, 0)
  }
];

const PROJECTS = [
  { id: "prj-alpha-ecommerce", clientId: "cli-alpha", name: "E-commerce Web", type: "Web", status: "active", repoFullName: "alpha-retail/ecommerce-web" },
  { id: "prj-alpha-crm", clientId: "cli-alpha", name: "CRM Interno", type: "Web", status: "active", repoFullName: "alpha-retail/crm-interno" },
  { id: "prj-alpha-mobile", clientId: "cli-alpha", name: "App Mobile", type: "Mobile", status: "paused", repoFullName: "alpha-retail/app-mobile" },
  { id: "prj-beta-erp", clientId: "cli-beta", name: "ERP Core", type: "Web", status: "active", repoFullName: "beta-mfg/erp-core" },
  { id: "prj-beta-portal", clientId: "cli-beta", name: "Portal de Proveedores", type: "Web", status: "active", repoFullName: "beta-mfg/portal-proveedores" },
  { id: "prj-gamma-marketplace", clientId: "cli-gamma", name: "Marketplace", type: "Web", status: "active", repoFullName: "gamma-market/marketplace-web" }
];

const ENV_NAMES = ["dev", "qa", "prod"];
const SUITE_DEFS = {
  Web: [
    { name: "Smoke Web", type: "smoke" },
    { name: "Regresion Web", type: "regression" },
    { name: "Visual Web", type: "visual" }
  ],
  Mobile: [
    { name: "Smoke Mobile", type: "smoke" },
    { name: "Regresion Mobile", type: "regression" }
  ]
};
const MODULES_BY_PROJECT = {
  "prj-alpha-ecommerce": ["Login", "Home", "Productos", "Carrito", "Checkout", "Pagos"],
  "prj-alpha-crm": ["Login", "Clientes", "Oportunidades", "Reportes"],
  "prj-alpha-mobile": ["Login", "Home", "Perfil", "Notificaciones"],
  "prj-beta-erp": ["Login", "Inventario", "Compras", "Facturacion"],
  "prj-beta-portal": ["Login", "Ordenes", "Pagos", "Documentos"],
  "prj-gamma-marketplace": ["Login", "Busqueda", "Publicaciones", "Mensajeria", "Pagos"]
};
const BRANCHES = ["main", "develop", "release/1.4", "feature/checkout-refactor"];
const DOC_CATEGORIES = [
  "Plan de pruebas",
  "Estrategia de automatizacion",
  "Matriz de pruebas",
  "Manual de usuario",
  "Documento de cierre",
  "Arquitectura"
];

let environments = [];
let suites = [];
let automationCoverage = [];
let integrations = [];
let documents = [];
let executions = [];
let testCases = [];
let evidences = [];
let reports = [];
let incidents = [];

let envSeq = 1, suiteSeq = 1, execSeq = 1, tcSeq = 1, evSeq = 1, repSeq = 1, incSeq = 1, docSeq = 1;

for (const project of PROJECTS) {
  // Ambientes
  const projectEnvs = ENV_NAMES.map((name) => ({
    id: `env-${envSeq++}`,
    projectId: project.id,
    name,
    baseUrl: `https://${name}.${project.repoFullName.split("/")[1]}.com`
  }));
  environments.push(...projectEnvs);

  // Suites
  const suiteDefs = SUITE_DEFS[project.type] || SUITE_DEFS.Web;
  const projectSuites = suiteDefs.map((def) => ({
    id: `suite-${suiteSeq++}`,
    projectId: project.id,
    name: def.name,
    type: def.type
  }));
  suites.push(...projectSuites);

  // Cobertura de automatizacion
  const automated = int(28, 96);
  const manual = int(6, 24);
  const pending = int(4, 18);
  automationCoverage.push({
    id: `cov-${project.id}`,
    projectId: project.id,
    automatedCases: automated,
    manualCases: manual,
    pendingCases: pending,
    updatedAt: isoDaysAgo(int(0, 3), 8, 0)
  });

  // Integracion GitHub (mock, desacoplada)
  integrations.push({
    id: `int-${project.id}`,
    projectId: project.id,
    provider: "github",
    repoFullName: project.repoFullName,
    defaultBranch: "main",
    connected: project.status === "active",
    lastSyncAt: isoDaysAgo(int(0, 2), 7, 30),
    lastWorkflowRun: {
      id: `run-${int(10000, 99999)}`,
      workflow: "automation.yml",
      status: pick(["success", "failure", "in_progress", "cancelled"]),
      branch: "main",
      actor: pick(["jolivos", "qa-bot", "ci-runner"])
    }
  });

  // Documentacion
  for (const category of pickN(DOC_CATEGORIES, int(3, DOC_CATEGORIES.length))) {
    documents.push({
      id: `doc-${docSeq++}`,
      clientId: project.clientId,
      projectId: project.id,
      category,
      title: `${category} - ${project.name}`,
      url: `/documentacion/${project.id}/${category.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      updatedAt: isoDaysAgo(int(1, 60), 10, 0)
    });
  }

  // Incidencias
  const incidentCount = int(1, 4);
  for (let i = 0; i < incidentCount; i++) {
    const isOpen = rand() > 0.55;
    incidents.push({
      id: `inc-${incSeq++}`,
      clientId: project.clientId,
      projectId: project.id,
      title: `Incidencia detectada en ${pick(MODULES_BY_PROJECT[project.id])}`,
      severity: pick(["low", "medium", "high", "critical"]),
      status: isOpen ? "open" : "closed",
      createdAt: isoDaysAgo(int(1, 45), 9, 0),
      closedAt: isOpen ? null : isoDaysAgo(int(0, 10), 15, 0)
    });
  }

  // Ejecuciones (ultimos 30 dias) por suite
  const modules = MODULES_BY_PROJECT[project.id];
  for (const suite of projectSuites) {
    const execCount = int(6, 12);
    for (let i = 0; i < execCount; i++) {
      const daysAgo = int(0, 29);
      const total = int(8, 22);
      let fail = suite.type === "visual" ? int(0, 2) : int(0, 4);
      let skipped = int(0, 2);
      let blocked = rand() > 0.85 ? int(1, 2) : 0;
      let passed = total - fail - skipped - blocked;
      if (passed < 0) {
        passed = total;
        fail = 0;
        skipped = 0;
        blocked = 0;
      }
      const status =
        blocked > 0 ? "error" : fail > 0 ? "failed" : rand() > 0.97 ? "cancelled" : "success";
      const durationSeconds = int(45, 40 * 60);
      const env = pick(projectEnvs.filter((e) => e.name !== "prod")) || projectEnvs[0];
      const execution = {
        id: `exec-${execSeq++}`,
        clientId: project.clientId,
        projectId: project.id,
        environmentId: env.id,
        suiteId: suite.id,
        branch: pick(BRANCHES),
        commit: Math.random().toString(16).slice(2, 9),
        date: isoDaysAgo(daysAgo, int(6, 20), int(0, 59)),
        durationSeconds,
        totals: { total, pass: passed, fail, skipped, blocked },
        status,
        browser: pick(["chromium", "firefox", "webkit"]),
        triggeredBy: pick(["github-actions", "manual", "scheduled"]),
        ciWorkflowRunId: `run-${int(10000, 99999)}`,
        source: "mock"
      };
      executions.push(execution);

      // Casos de prueba por ejecucion
      const usedModules = pickN(modules, Math.min(modules.length, int(3, 6)));
      let remainingFail = fail,
        remainingSkip = skipped,
        remainingBlocked = blocked;
      const caseCount = Math.min(total, int(4, 8));
      for (let c = 0; c < caseCount; c++) {
        let caseStatus = "PASS";
        if (remainingBlocked > 0 && rand() > 0.6) {
          caseStatus = "BLOCKED";
          remainingBlocked--;
        } else if (remainingFail > 0 && rand() > 0.4) {
          caseStatus = "FAIL";
          remainingFail--;
        } else if (remainingSkip > 0 && rand() > 0.5) {
          caseStatus = "SKIPPED";
          remainingSkip--;
        }
        const module = pick(usedModules);
        const testCase = {
          id: `tc-${tcSeq++}`,
          executionId: execution.id,
          code: `CP-${String(c + 1).padStart(3, "0")}`,
          title: `${module}: ${pick([
            "flujo valido",
            "flujo invalido",
            "validacion de campos",
            "carga de pagina",
            "confirmacion visual",
            "respuesta de API"
          ])}`,
          module,
          status: caseStatus,
          durationMs: int(300, 12000),
          errorMessage:
            caseStatus === "FAIL"
              ? pick([
                  "Timeout esperando selector #submit",
                  "Assertion failed: texto esperado no coincide",
                  "Elemento no visible tras navegacion",
                  "Respuesta 500 del servicio de pagos (mock)"
                ])
              : null
        };
        testCases.push(testCase);

        if (caseStatus === "FAIL" || caseStatus === "BLOCKED") {
          evidences.push({
            id: `ev-${evSeq++}`,
            executionId: execution.id,
            testCaseId: testCase.id,
            type: "screenshot",
            name: `${testCase.code}-failure.png`,
            url: `/mock-evidence/${execution.id}/${testCase.code}-failure.png`
          });
          evidences.push({
            id: `ev-${evSeq++}`,
            executionId: execution.id,
            testCaseId: testCase.id,
            type: "trace",
            name: `${testCase.code}-trace.zip`,
            url: `/mock-evidence/${execution.id}/${testCase.code}-trace.zip`
          });
        }
      }

      // Reportes por ejecucion
      reports.push({
        id: `rep-${repSeq++}`,
        executionId: execution.id,
        clientId: project.clientId,
        projectId: project.id,
        type: "playwright",
        name: `Reporte Playwright - ${execution.id}`,
        url: `/mock-reports/${execution.id}/playwright-report/index.html`
      });
      reports.push({
        id: `rep-${repSeq++}`,
        executionId: execution.id,
        clientId: project.clientId,
        projectId: project.id,
        type: "allure",
        name: `Reporte Allure - ${execution.id}`,
        url: `/mock-reports/${execution.id}/allure-report/index.html`
      });
    }
  }
}

const USERS = [
  { id: "usr-admin", name: "Jonathan Olivos", email: "jonathan@automatedsolutions.com", role: "admin", clientId: null },
  { id: "usr-qalead", name: "Ana Torres", email: "ana.torres@automatedsolutions.com", role: "qa_lead", clientId: null },
  { id: "usr-qaauto1", name: "Luis Ramirez", email: "luis.ramirez@automatedsolutions.com", role: "qa_automation", clientId: null },
  { id: "usr-qaauto2", name: "Sofia Mendez", email: "sofia.mendez@automatedsolutions.com", role: "qa_automation", clientId: null },
  { id: "usr-qamanual", name: "Carlos Ruiz", email: "carlos.ruiz@automatedsolutions.com", role: "qa_manual", clientId: null },
  { id: "usr-cli-alpha", name: "Cliente Alpha - Contacto", email: "qa-lead@alpharetail.com", role: "client", clientId: "cli-alpha" },
  { id: "usr-cli-beta", name: "Cliente Beta - Contacto", email: "it@betamanufacturing.com", role: "client", clientId: "cli-beta" },
  { id: "usr-cli-gamma", name: "Cliente Gamma - Contacto", email: "tech@gammamarket.com", role: "client", clientId: "cli-gamma" }
];

const files = {
  "clients.json": CLIENTS,
  "projects.json": PROJECTS,
  "environments.json": environments,
  "suites.json": suites,
  "executions.json": executions,
  "testCases.json": testCases,
  "evidences.json": evidences,
  "reports.json": reports,
  "documents.json": documents,
  "users.json": USERS,
  "integrations.json": integrations,
  "incidents.json": incidents,
  "automationCoverage.json": automationCoverage
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(content, null, 2), "utf8");
}

console.log(`Mock data generada en ${OUT_DIR}`);
console.log(
  Object.entries(files)
    .map(([name, content]) => `  - ${name}: ${content.length} registros`)
    .join("\n")
);
