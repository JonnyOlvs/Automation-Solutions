import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardTechnicalView } from "./DashboardTechnicalView";
import { DashboardExecutiveView } from "./DashboardExecutiveView";

export function DashboardPage() {
  const viewMode = useAppStore((s) => s.viewMode);

  return (
    <div>
      <PageHeader
        title={viewMode === "executive" ? "Vista Ejecutiva" : "Dashboard General"}
        description={
          viewMode === "executive"
            ? "Resumen simple del estado de tus pruebas automatizadas."
            : "KPIs y gráficas de la operación de QA Automation."
        }
      />
      {viewMode === "executive" ? <DashboardExecutiveView /> : <DashboardTechnicalView />}
    </div>
  );
}
