import { useQuery } from "@tanstack/react-query";
import { filtersApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";

export function ContextBar() {
  const { filters } = useAppStore();
  const { data: options } = useQuery({
    queryKey: ["filters-options", filters.clientId, filters.projectId],
    queryFn: () => filtersApi.options(filters.clientId, filters.projectId)
  });

  const client = options?.clients.find((c) => c.id === filters.clientId);
  const project = options?.projects.find((p) => p.id === filters.projectId);
  const environment = options?.environments.find((e) => e.id === filters.environmentId);

  if (!client && !project && !environment) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-brand-grayLight/60 px-6 py-2 text-xs font-medium text-brand-navy">
      {client && (
        <span>
          Cliente: <span className="font-semibold">{client.name}</span>
        </span>
      )}
      {project && (
        <span>
          Proyecto: <span className="font-semibold">{project.name}</span>
        </span>
      )}
      {environment && (
        <span>
          Ambiente: <span className="font-semibold uppercase">{environment.name}</span>
        </span>
      )}
    </div>
  );
}
