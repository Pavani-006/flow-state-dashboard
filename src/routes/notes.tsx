import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { useApp } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pin, PinOff, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Notes — Flowdesk" }, { name: "description", content: "Quick notes and pinned thoughts." }] }),
  component: NotesPage,
});

function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useApp();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [...notes]
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, query]);

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="Capture ideas before they vanish."
        actions={<Button onClick={() => addNote({ title: "Untitled note", content: "" })} className="gradient-primary text-primary-foreground shadow-glow"><Plus className="mr-2 h-4 w-4" />New note</Button>}
      />

      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<StickyNote className="h-5 w-5" />} title="No notes" description="Click 'New note' to create your first one." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <Card key={n.id} className={`group transition-all hover:shadow-elegant ${n.pinned ? "ring-1 ring-primary/30" : ""}`}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Input
                    value={n.title}
                    onChange={(e) => updateNote(n.id, { title: e.target.value })}
                    className="border-0 px-0 text-base font-semibold focus-visible:ring-0 shadow-none"
                  />
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => togglePinNote(n.id)}>
                      {n.pinned ? <PinOff className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteNote(n.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Textarea
                  value={n.content}
                  onChange={(e) => updateNote(n.id, { content: e.target.value })}
                  placeholder="Start writing…"
                  className="min-h-[140px] resize-none border-0 px-0 focus-visible:ring-0 shadow-none"
                />
                <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Updated {new Date(n.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
