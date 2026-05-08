import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Flowdesk" },
      { name: "description", content: "Plan your week with time blocking." },
    ],
  }),
  component: CalendarPage,
});

function startOfWeek(d) {
  const x = new Date(d);
  x.setDate(d.getDate() - d.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

function CalendarPage() {
  const { events, addEvent, deleteEvent } = useApp();
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
  });

  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(anchor);
        d.setDate(anchor.getDate() + i);
        return d;
      }),
    [anchor],
  );

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Time-block your week."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const d = new Date(anchor);
                d.setDate(d.getDate() - 7);
                setAnchor(d);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setAnchor(startOfWeek(new Date()))}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const d = new Date(anchor);
                d.setDate(d.getDate() + 7);
                setAnchor(d);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground shadow-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New event</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="time"
                      value={draft.startTime}
                      onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={draft.endTime}
                      onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (draft.title.trim()) {
                        addEvent({
                          title: draft.title.trim(),
                          date: draft.date,
                          startTime: draft.startTime,
                          endTime: draft.endTime,
                        });
                        setDraft({ ...draft, title: "" });
                        setOpen(false);
                      }
                    }}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const k = d.toISOString().slice(0, 10);
              const isToday = k === new Date().toISOString().slice(0, 10);
              const dayEvents = events
                .filter((e) => e.date === k)
                .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
              return (
                <div
                  key={k}
                  className={`min-h-[200px] rounded-xl border bg-card/40 p-2 ${isToday ? "ring-2 ring-primary/40" : ""}`}
                >
                  <div className="mb-2 flex items-baseline justify-between px-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        className="group rounded-lg bg-gradient-to-r from-primary/15 to-primary-glow/10 px-2 py-1.5 text-xs"
                      >
                        <div className="flex items-start gap-1">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{e.title}</p>
                            {e.startTime && (
                              <p className="text-[10px] text-muted-foreground">{e.startTime}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteEvent(e.id)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
