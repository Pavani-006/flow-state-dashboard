import { createFileRoute } from "@tanstack/react-router";
import { useApp, type Priority, type Status, type Task } from "@/store/app-store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Inbox, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Flowdesk" }, { name: "description", content: "Manage your tasks with list and Kanban views." }] }),
  component: TasksPage,
});

const COLUMNS: { key: Status; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

function priorityVariant(p: Priority) {
  return p === "high" ? "destructive" : p === "medium" ? "default" : "secondary";
}

function TasksPage() {
  const { tasks, addTask, deleteTask, toggleTask, updateTask } = useApp();
  const [query, setQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", priority: "medium" as Priority, dueDate: "", tags: "" });

  const filtered = useMemo(() => tasks.filter((t) => {
    const m = t.title.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase());
    const p = filterPriority === "all" || t.priority === filterPriority;
    return m && p;
  }), [tasks, query, filterPriority]);

  const submit = () => {
    if (!draft.title.trim()) return;
    addTask({
      title: draft.title.trim(),
      description: draft.description,
      priority: draft.priority,
      dueDate: draft.dueDate || undefined,
      tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setDraft({ title: "", description: "", priority: "medium", dueDate: "", tags: "" });
    setOpen(false);
    toast.success("Task created");
  };

  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("text/plain", id);
  const onDrop = (e: React.DragEvent, status: Status) => {
    const id = e.dataTransfer.getData("text/plain");
    if (id) updateTask(id, { status, completedAt: status === "done" ? new Date().toISOString() : undefined });
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Plan, prioritize, and ship."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow"><Plus className="mr-2 h-4 w-4" />New task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <Textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
                </div>
                <Input placeholder="Tags (comma separated)" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = filtered.filter((t) => t.status === col.key);
              return (
                <div
                  key={col.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, col.key)}
                  className="flex flex-col rounded-2xl border bg-muted/30 p-3 min-h-[300px]"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-sm font-semibold">{col.label}</p>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((t) => (
                      <Card
                        key={t.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, t.id)}
                        className="group cursor-grab active:cursor-grabbing transition-all hover:shadow-elegant"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-snug">{t.title}</p>
                              {t.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Badge variant={priorityVariant(t.priority)} className="h-4 px-1.5 text-[10px]">{t.priority}</Badge>
                                {t.tags.map((tag) => <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">#{tag}</span>)}
                                {t.dueDate && <span className="text-[10px] text-muted-foreground">· {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                              </div>
                            </div>
                            <button onClick={() => deleteTask(t.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {items.length === 0 && <p className="px-1 text-xs text-muted-foreground">Drop tasks here</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState icon={<Inbox className="h-5 w-5" />} title="No tasks found" description="Try adjusting filters or create a new task." />
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              {filtered.map((t: Task) => (
                <div key={t.id} className="flex items-center gap-3 border-b bg-card px-4 py-3 last:border-b-0 hover:bg-accent/30">
                  <Checkbox checked={t.status === "done"} onCheckedChange={() => toggleTask(t.id)} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                    {t.description && <p className="truncate text-xs text-muted-foreground">{t.description}</p>}
                  </div>
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  {t.dueDate && <span className="hidden text-xs text-muted-foreground sm:inline">{new Date(t.dueDate).toLocaleDateString()}</span>}
                  <Button size="icon" variant="ghost" onClick={() => deleteTask(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
