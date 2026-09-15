import { useQuery } from "@tanstack/react-query";
import { Github, GitBranch, GitCommit, User } from "lucide-react";
import { integrationsApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const WORKFLOW_STATUS_VARIANT: Record<string, "pass" | "fail" | "warning" | "neutral"> = {
  success: "pass",
  failure: "fail",
  in_progress: "warning",
  cancelled: "neutral"
};

export function IntegrationsPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["integrations", filters.projectId],
    queryFn: () => integrationsApi.list(filters.projectId)
  });

  return (
    <div>
      <PageHeader
        title="Integraciones"
        description="Conexión con GitHub y GitHub Actions. Actualmente simulada: el conector real (Octokit + token seguro solo en backend) se activa sin cambiar esta pantalla."
      />

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {integrations?.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Github className="h-4 w-4" /> {integration.repoFullName}
                </CardTitle>
                <Badge variant={integration.connected ? "pass" : "neutral"}>{integration.connected ? "Conectado" : "Sin conectar"}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Proyecto: {integration.project?.name}</p>
                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Última ejecución de workflow</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" /> {integration.lastWorkflowRun.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-3.5 w-3.5" /> {integration.lastWorkflowRun.workflow}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {integration.lastWorkflowRun.actor}
                    </span>
                    <Badge variant={WORKFLOW_STATUS_VARIANT[integration.lastWorkflowRun.status] ?? "neutral"}>
                      {integration.lastWorkflowRun.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
