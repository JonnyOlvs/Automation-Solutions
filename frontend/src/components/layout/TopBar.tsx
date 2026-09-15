import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Users2 } from "lucide-react";
import { filtersApi, authApi } from "@/api/endpoints";
import { useAppStore, roleLabel } from "@/store/useAppStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TopBar() {
  const { filters, setFilter, viewMode, setViewMode, currentUser, setCurrentUser } = useAppStore();

  const { data: options } = useQuery({
    queryKey: ["filters-options", filters.clientId, filters.projectId],
    queryFn: () => filtersApi.options(filters.clientId, filters.projectId)
  });

  const { data: users } = useQuery({ queryKey: ["users"], queryFn: authApi.users });

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-white px-6 py-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <ContextSelect
          placeholder="Cliente"
          value={filters.clientId}
          onChange={(v) => setFilter("clientId", v)}
          options={(options?.clients ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
        <ContextSelect
          placeholder="Proyecto"
          value={filters.projectId}
          onChange={(v) => setFilter("projectId", v)}
          options={(options?.projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
        />
        <ContextSelect
          placeholder="Ambiente"
          value={filters.environmentId}
          onChange={(v) => setFilter("environmentId", v)}
          options={(options?.environments ?? []).map((e) => ({ value: e.id, label: e.name.toUpperCase() }))}
        />
        <ContextSelect
          placeholder="Suite"
          value={filters.suiteId}
          onChange={(v) => setFilter("suiteId", v)}
          options={(options?.suites ?? []).map((s) => ({ value: s.id, label: s.name }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md bg-muted p-1 text-xs font-medium">
          <button
            onClick={() => setViewMode("executive")}
            className={`flex items-center gap-1 rounded-sm px-3 py-1.5 transition-colors ${
              viewMode === "executive" ? "bg-white text-brand-navy shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Users2 className="h-3.5 w-3.5" /> Ejecutiva
          </button>
          <button
            onClick={() => setViewMode("technical")}
            className={`flex items-center gap-1 rounded-sm px-3 py-1.5 transition-colors ${
              viewMode === "technical" ? "bg-white text-brand-navy shadow-sm" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Técnica
          </button>
        </div>

        <Select
          value={currentUser?.id ?? ""}
          onValueChange={(id) => setCurrentUser(users?.find((u) => u.id === id) ?? null)}
        >
          <SelectTrigger className="min-w-[190px]">
            <SelectValue placeholder="Sesión simulada" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} · {roleLabel(u.role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

function ContextSelect({
  placeholder,
  value,
  onChange,
  options
}: {
  placeholder: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={value ?? "__all__"} onValueChange={(v) => onChange(v === "__all__" ? undefined : v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Todos: {placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
