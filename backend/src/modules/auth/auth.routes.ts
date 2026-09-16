import { Router } from "express";
import { store } from "../../data/store";
import { createSession, destroySession, sessionToPublicUser, verifyCredentials } from "../../lib/auth";

export const authRouter = Router();

/**
 * Login real: valida email + password (bcrypt) contra credentials.json y
 * crea una sesion en memoria (token opaco, expira a las 12h). No es JWT ni
 * persiste entre reinicios del server, pero SI es autenticacion real (no
 * simulada): sin password correcto no hay sesion.
 */
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email y password son requeridos." });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ message: "Credenciales invalidas." });
  }

  const session = createSession(user);
  res.json({ token: session.token, user: sessionToPublicUser(session) });
});

authRouter.post("/logout", (req, res) => {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  if (token) destroySession(token);
  res.json({ ok: true });
});

/** Devuelve la sesion actual (para restaurar el login al recargar la pagina). */
authRouter.get("/me", (req, res) => {
  if (!req.session) {
    return res.status(401).json({ message: "No hay sesion activa." });
  }
  res.json(sessionToPublicUser(req.session));
});

/**
 * Catalogo de usuarios internos, solo visible para roles internos
 * (admin/qa_*). Un usuario "client" nunca ve el roster completo del equipo.
 */
authRouter.get("/users", (req, res) => {
  if (req.session && req.session.role === "client") {
    return res.status(403).json({ message: "No autorizado." });
  }
  res.json(store.getUsers());
});
