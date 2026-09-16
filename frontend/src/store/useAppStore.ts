import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExecutionFilters, SessionUser, UserRole } from "@/api/types";
import { setStoredAuthToken } from "@/api/client";

export type ViewMode = "executive" | "technical";

interface AppState {
  filters: ExecutionFilters;
  viewMode: ViewMode;
  /** Usuario real logueado (null = no hay sesion, debe ir a /login). */
  session: SessionUser | null;
  authToken: string | null;
  setFilter: <K extends keyof ExecutionFilters>(key: K, value: ExecutionFilters[K]) => void;
  setFilters: (filters: ExecutionFilters) => void;
  resetFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  login: (token: string, user: SessionUser) => void;
  logout: () => void;
}

const emptyFilters: ExecutionFilters = {};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filters: emptyFilters,
      viewMode: "technical",
      session: null,
      authToken: null,
      setFilter: (key, value) =>
        set((state) => {
          const next = { ...state.filters, [key]: value };
          // Cambiar de cliente reinicia el resto de la jerarquia (proyecto/ambiente/suite).
          if (key === "clientId") {
            next.projectId = undefined;
            next.environmentId = undefined;
            next.suiteId = undefined;
          }
          if (key === "projectId") {
            next.environmentId = undefined;
            next.suiteId = undefined;
          }
          return { filters: next };
        }),
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: emptyFilters }),
      setViewMode: (mode) => set({ viewMode: mode }),
      login: (token, user) => {
        setStoredAuthToken(token);
        set({
          authToken: token,
          session: user,
          // Si es un usuario "client", su vista queda fija en su propio cliente.
          filters: user.clientId ? { clientId: user.clientId } : emptyFilters
        });
      },
      logout: () => {
        setStoredAuthToken(null);
        set({ authToken: null, session: null, filters: emptyFilters });
      }
    }),
    {
      name: "automation-solutions-app-state",
      onRehydrateStorage: () => (state) => {
        // Mantiene sincronizado el token leido por el interceptor de axios (localStorage aparte)
        // con el que persiste zustand, por si el usuario limpio uno pero no el otro.
        if (state?.authToken) setStoredAuthToken(state.authToken);
      }
    }
  )
);

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "qa_lead":
      return "QA Lead";
    case "qa_automation":
      return "QA Automation";
    case "qa_manual":
      return "QA Manual";
    case "client":
      return "Cliente";
    default:
      return role;
  }
}
