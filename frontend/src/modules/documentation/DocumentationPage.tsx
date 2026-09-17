import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink } from "lucide-react";
import { documentsApi } from "@/api/endpoints";
import { toStaticUrl } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

const CATEGORY_TONE: Record<string, string> = {
  "Plan de pruebas": "info",
  "Estrategia de automatizacion": "pass",
  "Matriz de pruebas": "warning",
  "Manual de usuario": "neutral",
  "Documento de cierre": "fail",
  Arquitectura: "info"
};

export function DocumentationPage() {
  const filters = useAppStore((s) => s.filters);
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", filters.clientId, filters.projectId],
    queryFn: () => documentsApi.list(filters.clientId, filters.projectId)
  });

  return (
    <div>
      <PageHeader title="Documentación" description="Planes de prueba, estrategias, matrices, manuales y documentos de cierre por cliente/proyecto." />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !documents?.length ? (
        <EmptyState icon={BookOpen} title="Sin documentos" description="No hay documentación para el filtro seleccionado." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <a key={doc.id} href={toStaticUrl(doc.url)} target="_blank" rel="noreferrer">
              <Card className="h-full transition-shadow hover:shadow-elevated">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-sm text-foreground">{doc.title}</CardTitle>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant={(CATEGORY_TONE[doc.category] as any) ?? "outline"}>{doc.category}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(doc.updatedAt)}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
