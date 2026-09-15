import axios from "axios";

// En local, VITE_API_BASE_URL no esta definida y se usa "/api" (proxeado por
// Vite hacia el backend en :4000, ver vite.config.ts). En produccion
// (Cloudflare Pages) se define en el build, ej: https://api.automatedsolutionsgroup.org/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

/** Convierte URLs relativas (`/static/...`) del backend en absolutas cuando frontend y backend viven en dominios distintos. */
export function toStaticUrl(url: string): string {
  if (url.startsWith("http")) return url;
  if (!API_ORIGIN) return url;
  return `${API_ORIGIN}${url}`;
}
