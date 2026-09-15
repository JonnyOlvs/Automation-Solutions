import { Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
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

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route element={<AppLayout />}>
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
