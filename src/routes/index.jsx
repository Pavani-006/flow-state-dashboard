import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/store/app-store";
import { useAuth } from "@/store/auth-context";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Flame,
  Quote,
  Target,
  Timer,
  TrendingUp,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flowdesk" },
      { name: "description", content: "Your daily productivity command center." },
    ],
  }),
  component: DashboardPage,
});

const QUOTES = [
  { q: "Discipline equals freedom.", a: "Jocko Willink" },
  { q: "Slow is smooth, smooth is fast.", a: "Navy SEALs" },
  { q: "What gets measured gets managed.", a: "Peter Drucker" },
  { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
];

function useWeeklyData() {
  const { tasks, sessions } = useApp();
  return useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const completed = tasks.filter((t) => t.completedAt?.slice(0, 10) === key).length;
      const focus = sessions
        .filter((s) => s.completedAt.slice(0, 10) === key)
        .reduce((a, s) => a + s.durationMin, 0);
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        tasks: completed,
        focus,
      };
    });
    return days;
  }, [tasks, sessions]);
}

function DashboardPage() {
  const { tasks, goals, sessions, events, toggleTask, productivityScore } = useApp();
  const { user } = useAuth();
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks
    .filter((t) => t.dueDate?.slice(0, 10) === todayKey || t.status !== "done")
    .slice(0, 5);
  const focusToday = sessions
    .filter((s) => s.completedAt.slice(0, 10) === todayKey)
    .reduce((a, s) => a + s.durationMin, 0);
  const completedToday = tasks.filter((t) => t.completedAt?.slice(0, 10) === todayKey).length;
  const totalGoalProgress = goals.length
    ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
    : 0;
  const upcoming = events
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const data = useWeeklyData();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good to see you, ${user?.name || "Pavani"} 👋`}
        subtitle="Here's a snapshot of your day. Stay focused — you've got this."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/tasks">View tasks</Link>
            </Button>
            <Button asChild className="gradient-primary text-primary-foreground shadow-glow">
              <Link to="/focus">
                <Timer className="mr-2 h-4 w-4" />
                Start focus
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Productivity"
          value={`${productivityScore}`}
          delta="+12% vs last week"
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard
          label="Focus today"
          value={`${focusToday}m`}
          delta={`${sessions.filter((s) => s.completedAt.slice(0, 10) === todayKey).length} sessions`}
          icon={Flame}
          accent="warning"
        />
        <StatCard
          label="Tasks done"
          value={completedToday}
          delta={`of ${tasks.length} total`}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Goal progress"
          value={`${totalGoalProgress}%`}
          delta={`${goals.length} active`}
          icon={Target}
          accent="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Weekly productivity</CardTitle>
              <p className="text-xs text-muted-foreground">Tasks completed and focus minutes</p>
            </div>
            <Badge variant="secondary">Last 7 days</Badge>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="var(--color-chart-2)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="var(--color-chart-1)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="relative p-6 text-primary-foreground">
            <Quote className="h-6 w-6 opacity-80" />
            <p className="mt-3 text-lg font-medium leading-snug">"{quote.q}"</p>
            <p className="mt-2 text-sm opacity-80">— {quote.a}</p>
            <div className="mt-6 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs opacity-80">Daily streak</p>
              <p className="mt-1 text-2xl font-semibold">7 days 🔥</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today's focus</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">
                All tasks <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaysTasks.length === 0 && (
              <p className="text-sm text-muted-foreground">All clear for today 🎉</p>
            )}
            {todaysTasks.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-3 rounded-xl border bg-card/50 px-3 py-2.5 transition-colors hover:bg-accent/40"
              >
                <Checkbox checked={t.status === "done"} onCheckedChange={() => toggleTask(t.id)} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge
                      variant={
                        t.priority === "high"
                          ? "destructive"
                          : t.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {t.priority}
                    </Badge>
                    {t.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded bg-muted px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                    {t.dueDate && (
                      <span>
                        · due{" "}
                        {new Date(t.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Goal progress</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/goals">
                All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.slice(0, 3).map((g) => (
              <div key={g.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <span className="text-xs text-muted-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/calendar">
              Calendar <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
            )}
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(e.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <p className="mt-2 font-medium">{e.title}</p>
                {e.startTime && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.startTime}
                    {e.endTime && ` – ${e.endTime}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
