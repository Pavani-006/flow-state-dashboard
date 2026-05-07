import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Trash2, Trophy } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — Flowdesk" }, { name: "description", content: "Set, track, and crush your goals." }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, addGoal, deleteGoal, addMilestone, toggleMilestone } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", deadline: "" });
  const [newMilestones, setNewMilestones] = useState<Record<string, string>>({});

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="Big rocks first. Make every week count."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground shadow-glow"><Plus className="mr-2 h-4 w-4" />New goal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a goal</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Goal title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <Input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { if (draft.title.trim()) { addGoal({ title: draft.title.trim(), deadline: draft.deadline || undefined }); setDraft({ title: "", deadline: "" }); setOpen(false); } }}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {goals.length === 0 ? (
        <EmptyState icon={<Target className="h-5 w-5" />} title="No goals yet" description="Start by setting one meaningful goal for this quarter." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((g) => {
            const r = 36, c = 2 * Math.PI * r, off = c - (g.progress / 100) * c;
            return (
              <Card key={g.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{g.title}</CardTitle>
                    {g.deadline && <p className="mt-1 text-xs text-muted-foreground">Deadline {new Date(g.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>}
                  </div>
                  <div className="relative h-20 w-20">
                    <svg viewBox="0 0 100 100" className="-rotate-90">
                      <circle cx="50" cy="50" r={r} stroke="var(--color-muted)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r={r} stroke="url(#goalg)" strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={off} />
                      <defs>
                        <linearGradient id="goalg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="var(--color-primary-glow)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{g.progress}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={g.progress} className="mb-4" />
                  <div className="space-y-1.5">
                    {g.milestones.map((m) => (
                      <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/40">
                        <Checkbox checked={m.done} onCheckedChange={() => toggleMilestone(g.id, m.id)} />
                        <span className={`text-sm ${m.done ? "text-muted-foreground line-through" : ""}`}>{m.title}</span>
                        {m.done && <Trophy className="ml-auto h-3.5 w-3.5 text-warning" />}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Add milestone…"
                      value={newMilestones[g.id] ?? ""}
                      onChange={(e) => setNewMilestones({ ...newMilestones, [g.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (newMilestones[g.id] ?? "").trim()) {
                          addMilestone(g.id, newMilestones[g.id].trim());
                          setNewMilestones({ ...newMilestones, [g.id]: "" });
                        }
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => deleteGoal(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
