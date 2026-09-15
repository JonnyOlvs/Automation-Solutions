import { useQuery } from "@tanstack/react-query";
import { Camera, Clapperboard, FileText, Waypoints, FileBarChart, Image as ImageIcon, ChevronRight } from "lucide-react";
import { evidencesApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { ExecutionStatusBadge } from "@/components/ui/status-badge";

const EVIDENCE_ICON: Record<string, any> = {
  screenshot: Camera,
  video: Clapperboard,
  trace: Waypoints,
  log: FileText,
  report: FileBarChart
};

export function EvidencesPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: tree, isLoading } = useQuery({
    queryKey: ["evidences-tree", filters.clientId, filters.projectId],
    queryFn: () => evidencesApi.tree(filters.clientId, filters.projectId)
  });

  const hasAny = tree?.some((c: any) => c.projects.some((p: any) => p.executions.length));

  return (
    <div>
      <PageHeader
        title="Evidencias"
        description="Screenshots, videos, traces, logs y reportes organizados por Cliente → Proyecto → Ejecución → Caso."
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !hasAny ? (
        <EmptyState icon={ImageIcon} title="Sin evidencias" description="No hay evidencias para el filtro seleccionado." />
      ) : (
        <div className="space-y-3">
          {tree?.map((clientNode: any) => (
            <details key={clientNode.client.id} className="group rounded-lg border border-border bg-card" open>
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-brand-navy">
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                {clientNode.client.name}
              </summary>
              <div className="space-y-2 border-t border-border p-3">
                {clientNode.projects.map((projectNode: any) => (
                  <details key={projectNode.project.id} className="group rounded-md border border-border">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium">
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                      {projectNode.project.name}
                      <Badge variant="outline" className="ml-auto">
                        {projectNode.executions.length} ejecuciones
                      </Badge>
                    </summary>
                    <div className="space-y-2 border-t border-border p-3">
                      {projectNode.executions.map(({ execution, evidences }: any) => (
                        <details key={execution.id} className="group rounded-md bg-muted/40">
                          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs">
                            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                            <span className="font-mono">{execution.id}</span>
                            <span className="text-muted-foreground">{formatDate(execution.date)}</span>
                            <ExecutionStatusBadge status={execution.status} />
                            <Badge variant="outline" className="ml-auto">
                              {evidences.length} evidencias
                            </Badge>
                          </summary>
                          <div className="flex flex-wrap gap-2 p-3 pt-1">
                            {evidences.length ? (
                              evidences.map((ev: any) => {
                                const Icon = EVIDENCE_ICON[ev.type] ?? FileText;
                                return (
                                  <a
                                    key={ev.id}
                                    href={ev.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-muted/60"
                                  >
                                    <Icon className="h-3.5 w-3.5 text-brand-navy" />
                                    {ev.name}
                                  </a>
                                );
                              })
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin evidencias en esta ejecución.</p>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
