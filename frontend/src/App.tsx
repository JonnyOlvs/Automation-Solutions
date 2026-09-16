import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/modules/auth/LoginPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { ClientsPage } from "@/modules/clients/ClientsPage";
import { ClientDetailPage } from "@/modules/clients/ClientDetailPage";
import { ProjectsPage } from "@/modules/projects/ProjectsPage";
import { ProjectDetailPage } from "@/modules/projects/ProjectDetailPage";
import { ExecutionsPage } from "@/modules/executions/ExecutionsPage";
import { ExecutionDetailPage } from "@/modules/executions/ExecutionDetailPage";
import { SuitesPage } from "@/modules/suites/SuitesPage";
import { EvidencesPage } from "@/modules/evidences/EvidencesPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { DocumentationPage } from "@/modules/documentation/DocumentationPage";
import { MetricsPage } from "@/modules/metrics/MetricsPage";
import { IntegrationsPage } from "@/modules/integrations/IntegrationsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";
import { useAppStore } from "@/store/useAppStore";
import { registerUnauthorizedHandler } from "@/api/client";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authToken = useAppStore((s) => s.authToken);
  if (!authToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    // Si el backend responde 401 (token expirado/invalido), cerramos la sesion local.
    registerUnauthorizedHandler(() => logout());
  }, [logout]);

  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/proyectos/:id" element={<ProjectDetailPage />} />
          <Route path="/ejecuciones" element={<ExecutionsPage />} />
          <Route path="/ejecuciones/:id" element={<ExecutionDetailPage />} />
          <Route path="/suites" element={<SuitesPage />} />
          <Route path="/evidencias" element={<EvidencesPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/documentacion" element={<DocumentationPage />} />
          <Route path="/metricas" element={<MetricsPage />} />
          <Route path="/integraciones" element={<IntegrationsPage />} />
          <Route path="/configuracion" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}
