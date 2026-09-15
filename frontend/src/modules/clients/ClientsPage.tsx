import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, FolderKanban, TrendingUp, CheckCircle2 } from "lucide-react";
import { clientsApi } from "@/api/endpoints";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export function ClientsPage() {
  const { data: clients, isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });

  return (
    <div>
      <PageHeader title="Clientes" description="Empresas que utilizan la plataforma de QA Automation." />
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients?.map((client) => (
            <Link key={client.id} to={`/clientes/${client.id}`}>
              <Card className="h-full transition-shadow hover:shadow-elevated">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-foreground">{client.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{client.industry}</p>
                  </div>
                  <Badge variant={client.status === "active" ? "pass" : "neutral"} className="ml-auto">
                    {client.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <Stat icon={FolderKanban} label="Proyectos" value={client.summary?.projectsCount ?? 0} />
                  <Stat icon={CheckCircle2} label="Automatizados" value={client.summary?.automatedCases ?? 0} />
                  <Stat icon={TrendingUp} label="Éxito" value={`${client.summary?.successRate ?? 0}%`} />
                  <Stat label="Última ejecución" value={formatDate(client.summary?.lastExecutionDate)} small />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, small }: { icon?: any; label: string; value: string | number; small?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className={small ? "text-xs font-medium text-foreground" : "text-lg font-semibold text-brand-navy"}>{value}</p>
    </div>
  );
}
