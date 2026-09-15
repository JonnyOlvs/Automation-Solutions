#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { uploadDirToR2 } = require("./lib/r2Upload.cjs");

function pad(n) {
  return n.toString().padStart(2, "0");
}

function deleteRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      const childPath = path.join(targetPath, entry.name);
      deleteRecursive(childPath);
    }
    fs.rmdirSync(targetPath);
  } else {
    fs.unlinkSync(targetPath);
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      copyRecursive(srcPath, destPath);
    }
  } else {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function resolveBranch() {
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  try {
    const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" });
    const branch = (result.stdout || "").trim();
    return branch && branch !== "HEAD" ? branch : "main";
  } catch {
    return "main";
  }
}

function resolveCommit() {
  const sha = process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
    const commit = (result.stdout || "").trim();
    return commit || null;
  } catch {
    return null;
  }
}

function inferBrowserFromArgs(extraArgs) {
  const projectEq = extraArgs.find((a) => a.startsWith("--project="));
  if (projectEq) {
    return projectEq.split("=")[1] || "multi";
  }
  const idx = extraArgs.findIndex((a) => a === "--project" || a === "-p");
  if (idx !== -1 && extraArgs[idx + 1]) {
    return extraArgs[idx + 1];
  }
  return null;
}

async function collectArtifacts(status, durationSeconds, extraArgs) {
  const root = process.cwd();
  const now = new Date();

  const year = now.getFullYear().toString();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  const project = process.env.AS_PROJECT || "Web";
  const execId = `exec-${year}${month}${day}-${hh}${mm}${ss}`;

  const evidRoot = path.join(root, "evidencias", project, year, month, day, execId);
  fs.mkdirSync(evidRoot, { recursive: true });

  const screenshotsDir = path.join(evidRoot, "screenshots");
  const videosDir = path.join(evidRoot, "videos");
  const traceDir = path.join(evidRoot, "trace");
  const logsDir = path.join(evidRoot, "logs");
  const reportDir = path.join(evidRoot, "report");
  const allureDir = path.join(evidRoot, "allure-report");

  [screenshotsDir, videosDir, traceDir, logsDir, reportDir, allureDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const testResultsDir = path.join(root, "test-results");
  if (fs.existsSync(testResultsDir)) {
    const stack = [testResultsDir];
    while (stack.length > 0) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(srcPath);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") {
            copyRecursive(srcPath, path.join(screenshotsDir, entry.name));
          } else if (ext === ".mp4" || ext === ".webm" || ext === ".ogg") {
            copyRecursive(srcPath, path.join(videosDir, entry.name));
          } else if (ext === ".zip" || ext === ".trace" || entry.name.includes("trace")) {
            copyRecursive(srcPath, path.join(traceDir, entry.name));
          } else if (ext === ".log" || ext === ".txt") {
            copyRecursive(srcPath, path.join(logsDir, entry.name));
          }
        }
      }
    }
  }

  const pwReportDir = path.join(root, "reports", "playwright-report");
  if (fs.existsSync(pwReportDir)) {
    copyRecursive(pwReportDir, reportDir);
  }

  try {
    const gen = spawnSync(
      "npx",
      ["allure", "generate", "allure-results", "--clean", "-o", "reports/allure-report"],
      { stdio: "inherit", shell: true }
    );
    if (gen.status !== 0) {
      console.warn("No se pudo generar reporte Allure HTML. ¿Está instalado allure-commandline?");
    }
  } catch (e) {
    console.warn("Error al generar reporte Allure:", e);
  }

  const allureReportDir = path.join(root, "reports", "allure-report");
  if (fs.existsSync(allureReportDir)) {
    copyRecursive(allureReportDir, allureDir);
  }

  const inferredBrowser = inferBrowserFromArgs(extraArgs) || "chromium";
  const browser = process.env.AS_BROWSER || inferredBrowser;
  const user =
    process.env.AS_USER ||
    process.env.USERNAME ||
    process.env.USER ||
    "local";

  const executionMeta = {
    id: execId,
    name: process.env.AS_EXEC_NAME || `Playwright run - ${project}`,
    project,
    date: now.toISOString(),
    durationSeconds,
    status,
    browser,
    user,
    branch: resolveBranch(),
    commit: resolveCommit(),
    ciWorkflowRunId: process.env.GITHUB_RUN_ID || null
  };

  fs.writeFileSync(
    path.join(evidRoot, "execution.json"),
    JSON.stringify(executionMeta, null, 2),
    "utf8"
  );

  console.log(`\nEvidencias recopiladas en: ${path.relative(root, evidRoot)}`);

  const bucketPrefix = `evidencias/${project}/${year}/${month}/${day}/${execId}`;
  await uploadDirToR2({ localDir: evidRoot, bucketPrefix });
}

async function main() {
  const start = Date.now();

  const root = process.cwd();
  // Limpiar resultados previos de Allure y reportes antes de cada corrida
  deleteRecursive(path.join(root, "allure-results"));
  deleteRecursive(path.join(root, "reports", "allure-report"));
  deleteRecursive(path.join(root, "reports", "playwright-report"));

  const extraArgs = process.argv.slice(2);
  const args = ["playwright", "test", "-c", "config/playwright.config.ts", ...extraArgs];
  const result = spawnSync("npx", args, {
    stdio: "inherit",
    shell: true
  });

  const durationSeconds = Math.round((Date.now() - start) / 1000);
  const status = result.status === 0 ? "passed" : "failed";

  try {
    await collectArtifacts(status, durationSeconds, extraArgs);
  } catch (err) {
    console.error("Error al recopilar evidencias:", err);
  }

  process.exit(result.status ?? 1);
}

main();

