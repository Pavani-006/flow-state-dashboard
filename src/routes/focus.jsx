import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, RotateCcw, Coffee, Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus — Flowdesk" },
      { name: "description", content: "Pomodoro focus sessions." },
    ],
  }),
  component: FocusPage,
});

const PRESETS = [
  { label: "Focus 25", min: 25, kind: "focus", icon: Brain },
  { label: "Focus 50", min: 50, kind: "focus", icon: Brain },
  { label: "Short break", min: 5, kind: "break", icon: Coffee },
  { label: "Long break", min: 15, kind: "break", icon: Coffee },
];

function FocusPage() {
  const { sessions, addSession } = useApp();
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("Deep work");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          addSession({ durationMin: Math.round(duration / 60), label });
          toast.success("Session complete! Great work 🎯");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, duration, label, addSession]);

  const start = (min, lbl) => {
    setDuration(min * 60);
    setRemaining(min * 60);
    setLabel(lbl);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const pct = ((duration - remaining) / duration) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.completedAt.slice(0, 10) === todayKey);
  const totalToday = todaySessions.reduce((a, s) => a + s.durationMin, 0);

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div>
      <PageHeader title="Focus session" subtitle="Block out distractions and ship deep work." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/10" />
          <CardContent className="relative flex flex-col items-center py-12">
            <Badge variant="secondary" className="mb-6">
              {label}
            </Badge>
            <div className="relative flex items-center justify-center">
              <svg width="320" height="320" className="-rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="var(--color-muted)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="url(#focusGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />

                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-primary-glow)" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                className={`absolute flex flex-col items-center ${running ? "animate-pulse-ring rounded-full" : ""}`}
              >
                <span className="text-6xl font-bold tabular-nums tracking-tight">
                  {mm}:{ss}
                </span>
                <span className="mt-1 text-xs text-muted-foreground uppercase tracking-widest">
                  {running ? "In session" : "Ready"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" variant="outline" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground shadow-glow"
                onClick={() => setRunning((r) => !r)}
              >
                {running ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant="ghost"
                  className="justify-start gap-2 border bg-card/50"
                  onClick={() => start(p.min, p.label)}
                >
                  <p.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{p.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{p.min}m</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {totalToday}
                <span className="ml-1 text-base font-normal text-muted-foreground">min</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {todaySessions.length} sessions completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border bg-card/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{s.label ?? "Focus"}</span>
                  <span className="text-muted-foreground">
                    {s.durationMin}m ·{" "}
                    {new Date(s.completedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground">No sessions yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
