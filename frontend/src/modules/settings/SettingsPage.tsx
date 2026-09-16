import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCircle2, Download, Github, Circle, CheckCircle2, LogOut } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { useAppStore, roleLabel } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ROADMAP = [
  { label: "Autenticación real (login + password + sesiones) y aislamiento por cliente", status: "done" },
  { label: "Integración real con GitHub API + GitHub Actions", status: "pending" },
  { label: "Exportación a PDF / Excel de reportes y evidencias", status: "pending" },
  { label: "Persistencia en PostgreSQL (reemplazo de repositorios JSON)", status: "pending" }
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { session, logout } = useAppStore();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores de red al cerrar sesion; de todos modos limpiamos localmente.
    }
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <PageHeader title="Configuración" description="Tu sesión, roles y estado del roadmap de la plataforma." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" /> Mi sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session ? (
              <>
                <div className="rounded-md border border-border px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">{session.name}</p>
                  <p className="text-xs text-muted-foreground">{session.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">{roleLabel(session.role)}</Badge>
                    {session.client && <Badge variant="info">{session.client.name}</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.client
                    ? `Tu cuenta esta restringida a los datos de ${session.client.name}. No puedes ver otros clientes.`
                    : "Cuenta interna: puedes ver todos los clientes desde los filtros superiores."}
                </p>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay sesión activa.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Roadmap / Fases pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ROADMAP.map((item) => (
              <div key={item.label} className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
                {item.status === "done" ? (
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-status-pass" />
                ) : (
                  <Circle className="mt-0.5 h-3 w-3 shrink-0 text-status-warning" />
                )}
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportación
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" disabled>
              Exportar PDF
            </Button>
            <Button variant="outline" disabled>
              Exportar Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-4 w-4" /> Acerca de
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Automated Solutions — QA Automation Platform. Corre localmente sobre datos mock + ejecuciones reales de Playwright. Lista
            para desplegarse detrás de Cloudflare en un dominio propio.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
