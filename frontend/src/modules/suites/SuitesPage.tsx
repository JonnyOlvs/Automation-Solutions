import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { projectsApi, filtersApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function SuitesPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects", filters.clientId],
    queryFn: () => projectsApi.list(filters.clientId)
  });
  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ["filters-options-suites", filters.clientId, filters.projectId],
    queryFn: () => filtersApi.options(filters.clientId, filters.projectId)
  });

  const isLoading = loadingProjects || loadingOptions;
  const projectIds = new Set((projects ?? []).map((p) => p.id));
  const suites = (options?.suites ?? []).filter((s) => !filters.projectId || projectIds.has(s.projectId));

  return (
    <div>
      <PageHeader title="Suites de Pruebas" description="Conjuntos de pruebas organizados por proyecto." />
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : !suites.length ? (
        <EmptyState icon={ListChecks} title="Sin suites" description="No hay suites para el filtro seleccionado." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((project) => {
            const projectSuites = suites.filter((s) => s.projectId === project.id);
            if (!projectSuites.length) return null;
            return (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    <Link to={`/proyectos/${project.id}`} className="hover:text-brand-green">
                      {project.name}
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{project.client?.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {projectSuites.map((suite) => (
                    <div key={suite.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <ListChecks className="h-3.5 w-3.5 text-brand-green" />
                        {suite.name}
                      </span>
                      <Badge variant="outline">{suite.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
