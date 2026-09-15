import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts as DashboardChartsData } from "@/api/types";

const COLORS = {
  pass: "#2A8C46",
  fail: "#DC2626",
  skipped: "#9CA3AF",
  blocked: "#D97706",
  navy: "#091730",
  info: "#2563EB"
};

function shortDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function ExecutionsPerDayChart({ data }: { data: DashboardChartsData["executionsPerDay"] }) {
  return (
    <ChartCard title="Ejecuciones por día">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip labelFormatter={(v) => shortDate(String(v))} />
          <Bar dataKey="count" name="Ejecuciones" fill={COLORS.navy} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ResultsDistributionChart({ data }: { data: DashboardChartsData["resultsDistribution"] }) {
  const pieData = [
    { name: "PASS", value: data.PASS, color: COLORS.pass },
    { name: "FAIL", value: data.FAIL, color: COLORS.fail },
    { name: "SKIPPED", value: data.SKIPPED, color: COLORS.skipped },
    { name: "BLOCKED", value: data.BLOCKED, color: COLORS.blocked }
  ];
  return (
    <ChartCard title="Distribución de resultados">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SuccessTrendChart({ data }: { data: DashboardChartsData["successTrend"] }) {
  return (
    <ChartCard title="Tendencia de éxito">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip labelFormatter={(v) => shortDate(String(v))} formatter={(v) => [`${v}%`, "Éxito"]} />
          <Line type="monotone" dataKey="successRate" stroke={COLORS.pass} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AutomationBreakdownChart({ data }: { data: DashboardChartsData["automationBreakdown"] }) {
  const pieData = [
    { name: "Automatizados", value: data.automated, color: COLORS.pass },
    { name: "Manuales", value: data.manual, color: COLORS.info },
    { name: "Pendientes", value: data.pending, color: COLORS.blocked }
  ];
  return (
    <ChartCard title="Automatización">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DurationTrendChart({ data }: { data: DashboardChartsData["durationTrend"] }) {
  return (
    <ChartCard title="Duración de ejecuciones">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="durationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.info} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={(v) => shortDate(String(v))} formatter={(v) => [`${v}s`, "Duración prom."]} />
          <Area type="monotone" dataKey="avgDurationSeconds" stroke={COLORS.info} fill="url(#durationFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopFailingModulesChart({ data }: { data: DashboardChartsData["topFailingModules"] }) {
  return (
    <ChartCard title="Módulos con más fallos">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F5" />
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="module" width={90} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="failures" name="Fallos" fill={COLORS.fail} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
