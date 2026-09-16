#!/usr/bin/env node
/**
 * Wrapper multiplataforma para correr el smoke test real de Zerimar
 * (src/tests/e2e/zerimar.spec.ts) contra https://zerimarsoftware.com/ y
 * publicar las evidencias (screenshots/video/trace/reporte) igual que una
 * corrida normal, pero etiquetadas como proyecto "Zerimar" en el dashboard.
 *
 * Uso:
 *   npm run test:zerimar:dash
 */
const path = require("path");

process.env.AS_PROJECT = "Zerimar";
process.env.AS_EXEC_NAME = process.env.AS_EXEC_NAME || "Smoke zerimarsoftware.com";
process.env.VIDEO = process.env.VIDEO || "on";

// Reutiliza run-with-evidences.cjs (mismo proceso Node, mismo cwd) con el filtro @zerimar.
process.argv = [process.argv[0], process.argv[1], "--grep", "@zerimar"];
require(path.join(__dirname, "run-with-evidences.cjs"));
