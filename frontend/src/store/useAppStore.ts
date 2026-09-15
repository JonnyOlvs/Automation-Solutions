import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExecutionFilters, User, UserRole } from "@/api/types";

export type ViewMode = "executive" | "technical";

interface AppState {
  filters: ExecutionFilters;
  viewMode: ViewMode;
  currentUser: User | null;
  setFilter: <K extends keyof ExecutionFilters>(key: K, value: ExecutionFilters[K]) => void;
  setFilters: (filters: ExecutionFilters) => void;
  resetFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setCurrentUser: (user: User | null) => void;
}

const emptyFilters: ExecutionFilters = {};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filters: emptyFilters,
      viewMode: "technical",
      currentUser: null,
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
      setCurrentUser: (user) => set({ currentUser: user })
    }),
    { name: "automation-solutions-app-state" }
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
