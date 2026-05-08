import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Flowdesk" },
      { name: "description", content: "Visualize your productivity trends." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { tasks, sessions } = useApp();

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const k = d.toISOString().slice(0, 10);
        return {
          day: d.toLocaleDateString(undefined, { weekday: "short" }),
          tasks: tasks.filter((t) => t.completedAt?.slice(0, 10) === k).length,
          focus: sessions
            .filter((s) => s.completedAt.slice(0, 10) === k)
            .reduce((a, s) => a + s.durationMin, 0),
        };
      }),
    [tasks, sessions],
  );

  const pieData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => counts[t.priority]++);
    return [
      { name: "High", value: counts.high, fill: "var(--color-chart-5)" },
      { name: "Medium", value: counts.medium, fill: "var(--color-chart-1)" },
      { name: "Low", value: counts.low, fill: "var(--color-chart-3)" },
    ];
  }, [tasks]);

  const heatmap = useMemo(() => {
    const grid = [];
    for (let i = 41; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const count =
        tasks.filter((t) => t.completedAt?.slice(0, 10) === k).length +
        sessions.filter((s) => s.completedAt.slice(0, 10) === k).length;
      grid.push({ date: k, count });
    }
    return grid;
  }, [tasks, sessions]);

  const heatColor = (n) => {
    if (n === 0) return "bg-muted";
    if (n < 2) return "bg-primary/30";
    if (n < 4) return "bg-primary/55";
    if (n < 6) return "bg-primary/75";
    return "bg-primary";
  };

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Trends, heatmaps, and time distribution." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks completed (7d)</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="tasks" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Focus minutes (7d)</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="focus" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity heatmap (6 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {heatmap.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} actions`}
                  className={`h-4 w-4 rounded-sm ${heatColor(d.count)} transition-transform hover:scale-110`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-primary/30" />
              <div className="h-3 w-3 rounded-sm bg-primary/55" />
              <div className="h-3 w-3 rounded-sm bg-primary/75" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
