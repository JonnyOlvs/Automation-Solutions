import axios from "axios";

// En local, VITE_API_BASE_URL no esta definida y se usa "/api" (proxeado por
// Vite hacia el backend en :4000, ver vite.config.ts). En produccion
// (Cloudflare Pages) se define en el build, ej: https://api.automatedsolutionsgroup.org/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const AUTH_TOKEN_STORAGE_KEY = "automation-solutions-auth-token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

/** Guarda/lee el token fuera de zustand para que el interceptor de axios lo lea sin depender de imports circulares. */
export function setStoredAuthToken(token: string | null): void {
  if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Callback opcional que App.tsx registra para reaccionar a una sesion expirada/invalida (401). */
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setStoredAuthToken(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Convierte URLs relativas (`/static/...`) del backend en absolutas cuando frontend y backend viven en dominios distintos. */
export function toStaticUrl(url: string): string {
  if (url.startsWith("http")) return url;
  if (!API_ORIGIN) return url;
  return `${API_ORIGIN}${url}`;
}
