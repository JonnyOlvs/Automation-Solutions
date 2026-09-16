import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { store } from "../data/store";
import { User, UserRole } from "../types";

/**
 * Autenticacion "ligera pero real": sesiones en memoria (token opaco, no JWT)
 * respaldadas por password hasheado con bcrypt en credentials.json.
 *
 * No es un sistema de produccion a gran escala (no persiste sesiones entre
 * reinicios del server, no rota tokens), pero SI valida password real,
 * expira sesiones y aisla datos por clientId, que es lo que se necesita
 * para que un cliente (ej. Zerimar) tenga su propio login y solo vea lo suyo.
 */

interface Credential {
  userId: string;
  email: string;
  passwordHash: string;
}

/**
 * En dev (ts-node-dev) __dirname apunta a backend/src/lib.
 * En produccion (Render, build con tsc) __dirname apunta a backend/dist/lib.
 * credentials.json (como el resto de mock/) NUNCA se copia a dist, asi que
 * anclamos la ruta en la raiz del backend y apuntamos explicitamente a
 * src/data/mock (mismo fix ya aplicado en backend/src/data/store.ts).
 */
const BACKEND_ROOT = path.join(__dirname, "..", ".."); // src/lib -> backend ; dist/lib -> backend
const CREDENTIALS_PATH = path.join(BACKEND_ROOT, "src", "data", "mock", "credentials.json");
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

export interface SessionData {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  clientId: string | null;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

function loadCredentials(): Credential[] {
  try {
    const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(raw) as Credential[];
  } catch {
    return [];
  }
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  if (!email || !password) return null;
  const credentials = loadCredentials();
  const credential = credentials.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (!credential) return null;

  const isValid = await bcrypt.compare(password, credential.passwordHash);
  if (!isValid) return null;

  return store.getUserById(credential.userId) ?? null;
}

export function createSession(user: User): SessionData {
  const token = crypto.randomBytes(32).toString("hex");
  const session: SessionData = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  sessions.set(token, session);
  return session;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function getSession(token?: string): SessionData | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionData | null;
    }
  }
}

/** Lee el header Authorization: Bearer <token> y adjunta la sesion (o null) a req.session. Nunca bloquea. */
export function attachSession(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  req.session = getSession(token);
  next();
}

/** Bloquea el acceso (401) si no hay una sesion valida adjunta por attachSession. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session) {
    res.status(401).json({ message: "Sesion invalida o expirada. Inicia sesion de nuevo." });
    return;
  }
  next();
}

/**
 * Si la sesion es de un usuario "client", fuerza el clientId en la query
 * string (usado por casi todos los endpoints de listado) para que jamas
 * pueda ver datos de otro cliente sin importar lo que mande en la URL.
 */
export function enforceClientScope(req: Request, _res: Response, next: NextFunction): void {
  if (req.session && req.session.role === "client" && req.session.clientId) {
    req.query.clientId = req.session.clientId;
  }
  next();
}

/**
 * Guard de 403 para endpoints por :id (clientes/proyectos/ejecuciones) que no
 * pasan por query string. Devuelve true si el acceso esta permitido.
 */
export function assertClientOwnership(req: Request, res: Response, targetClientId: string | null | undefined): boolean {
  if (req.session && req.session.role === "client" && targetClientId && targetClientId !== req.session.clientId) {
    res.status(403).json({ message: "No autorizado para ver este recurso." });
    return false;
  }
  return true;
}

export function sessionToPublicUser(session: SessionData) {
  const client = session.clientId ? store.getClientById(session.clientId) : undefined;
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    clientId: session.clientId,
    client: client
      ? { id: client.id, name: client.name, slug: client.slug, logoUrl: client.logoUrl, primaryColor: client.primaryColor }
      : null
  };
}
