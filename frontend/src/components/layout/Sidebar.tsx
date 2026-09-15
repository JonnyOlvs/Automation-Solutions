import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  PlayCircle,
  ListChecks,
  Image as ImageIcon,
  FileBarChart,
  BookOpen,
  LineChart,
  Plug,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { to: "/ejecuciones", label: "Ejecuciones", icon: PlayCircle },
  { to: "/suites", label: "Suites de Pruebas", icon: ListChecks },
  { to: "/evidencias", label: "Evidencias", icon: ImageIcon },
  { to: "/reportes", label: "Reportes", icon: FileBarChart },
  { to: "/documentacion", label: "Documentación", icon: BookOpen },
  { to: "/metricas", label: "Métricas", icon: LineChart },
  { to: "/integraciones", label: "Integraciones", icon: Plug },
  { to: "/configuracion", label: "Configuración", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-brand-navy text-white lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green font-bold">AS</div>
        <div>
          <p className="text-sm font-semibold leading-tight">Automated Solutions</p>
          <p className="text-[11px] leading-tight text-white/50">QA Automation Platform</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                isActive && "bg-brand-green/90 text-white shadow-sm hover:bg-brand-green"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-3 text-[11px] text-white/40">
        Confidence in every release
      </div>
    </aside>
  );
}
