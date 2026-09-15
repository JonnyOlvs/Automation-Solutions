import { ReactNode } from "react";
import { Breadcrumb, Crumb } from "@/components/ui/breadcrumb";

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions
}: {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        {breadcrumb && <div className="mb-1.5">{<Breadcrumb items={breadcrumb} />}</div>}
        <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
