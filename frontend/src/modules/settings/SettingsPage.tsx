import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users, Download, Github, Circle } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { useAppStore, roleLabel } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ROADMAP = [
  { label: "Autenticación real (JWT) y tokens de GitHub protegidos en backend", status: "pending" },
  { label: "Integración real con GitHub API + GitHub Actions", status: "pending" },
  { label: "Exportación a PDF / Excel de reportes y evidencias", status: "pending" },
  { label: "Persistencia en PostgreSQL (reemplazo de repositorios JSON)", status: "pending" }
];

export function SettingsPage() {
  const { currentUser, setCurrentUser } = useAppStore();
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: authApi.users });

  return (
    <div>
      <PageHeader title="Configuración" description="Sesión simulada, roles y estado del roadmap de la plataforma." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Sesión simulada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              La autenticación real está preparada en la arquitectura pero no implementada todavía. Mientras tanto, elige un usuario
              para simular su rol y lo que vería en la plataforma.
            </p>
            <div className="space-y-1.5">
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setCurrentUser(user)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    currentUser?.id === user.id ? "border-brand-green bg-brand-green/5" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <span>
                    <span className="font-medium text-foreground">{user.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <Badge variant="outline">{roleLabel(user.role)}</Badge>
                </button>
              ))}
            </div>
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
                <Circle className="mt-0.5 h-3 w-3 shrink-0 text-status-warning" />
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
