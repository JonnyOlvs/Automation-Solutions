import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { authRouter } from "./modules/auth/auth.routes";
import { EVIDENCIAS_STATIC_ROOT } from "./lib/playwrightBridge";
import { startCiEvidencePolling } from "./lib/ciEvidenceBridge";
import { attachSession, enforceClientScope, requireAuth } from "./lib/auth";

dotenv.config();

const app = express();
// Render/otros PaaS inyectan PORT; BACKEND_PORT sigue funcionando en local.
const PORT = Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 4000);

app.use(cors());
app.use(express.json());

// Sirve las evidencias reales generadas por Playwright (screenshots, videos,
// traces, logs, reportes) para que el frontend pueda abrirlas directamente.
app.use("/static/evidencias", express.static(EVIDENCIAS_STATIC_ROOT));
app.use("/static/reports", express.static(path.join(__dirname, "..", "..", "reports")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "automation-solutions-backend" });
});

// Login/logout/me: necesitan leer la sesion (attachSession) pero NO pueden
// requerir que ya exista una (por eso no llevan requireAuth).
app.use("/api/auth", attachSession, authRouter);

// Resto de la API: requiere sesion valida + aplica el aislamiento por
// clientId cuando el usuario logueado es de tipo "client" (ej. Zerimar).
app.use("/api", attachSession, requireAuth, enforceClientScope, apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Recurso no encontrado" });
});

app.listen(PORT, () => {
  console.log(`[backend] Automation Solutions API escuchando en http://localhost:${PORT}`);
  startCiEvidencePolling();
});
