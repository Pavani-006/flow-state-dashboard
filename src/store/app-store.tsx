import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  deadline?: string;
  milestones: { id: string; title: string; done: boolean }[];
  createdAt: string;
}

export interface FocusSession {
  id: string;
  durationMin: number;
  completedAt: string;
  label?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date (yyyy-mm-dd)
  startTime?: string;
  endTime?: string;
  color?: string;
}

interface AppState {
  tasks: Task[];
  goals: Goal[];
  sessions: FocusSession[];
  notes: Note[];
  events: CalendarEvent[];
  theme: "light" | "dark";
}

const STORAGE_KEY = "flowdesk-state-v1";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const seed = (): AppState => {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return isoDate(d);
  };
  return {
    theme: "light",
    tasks: [
      { id: uid(), title: "Review Q3 product roadmap", description: "Align with design and engineering on Q3 priorities.", priority: "high", status: "in_progress", dueDate: day(0), tags: ["work", "planning"], createdAt: today() },
      { id: uid(), title: "Write weekly newsletter", priority: "medium", status: "todo", dueDate: day(1), tags: ["content"], createdAt: today() },
      { id: uid(), title: "Refactor dashboard charts", priority: "medium", status: "todo", dueDate: day(2), tags: ["dev"], createdAt: today() },
      { id: uid(), title: "Morning workout", priority: "low", status: "done", dueDate: day(0), tags: ["health"], createdAt: today(), completedAt: today() },
      { id: uid(), title: "Reply to investor emails", priority: "high", status: "todo", dueDate: day(0), tags: ["work"], createdAt: today() },
      { id: uid(), title: "Plan team offsite", priority: "low", status: "in_progress", tags: ["team"], createdAt: today() },
    ],
    goals: [
      { id: uid(), title: "Ship v2.0 of Flowdesk", progress: 62, deadline: day(28), milestones: [
        { id: uid(), title: "Design system overhaul", done: true },
        { id: uid(), title: "New onboarding flow", done: true },
        { id: uid(), title: "Analytics rebuild", done: false },
        { id: uid(), title: "Public launch", done: false },
      ], createdAt: today() },
      { id: uid(), title: "Read 12 books this year", progress: 75, milestones: [], createdAt: today() },
      { id: uid(), title: "Run a half marathon", progress: 40, deadline: day(60), milestones: [], createdAt: today() },
    ],
    sessions: Array.from({ length: 14 }).map((_, i) => ({
      id: uid(),
      durationMin: 25,
      completedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString(),
      label: i % 2 ? "Deep work" : "Writing",
    })),
    notes: [
      { id: uid(), title: "Product principles", content: "1. Clarity beats cleverness.\n2. Defaults matter more than features.\n3. Speed is a feature.", pinned: true, updatedAt: today() },
      { id: uid(), title: "Meeting notes — Mon", content: "Discussed roadmap, hiring plan, and Q3 OKRs.", pinned: false, updatedAt: today() },
    ],
    events: [
      { id: uid(), title: "Standup", date: day(0), startTime: "09:30", endTime: "09:45" },
      { id: uid(), title: "Design review", date: day(0), startTime: "14:00", endTime: "15:00" },
      { id: uid(), title: "1:1 with Alex", date: day(1), startTime: "11:00", endTime: "11:30" },
      { id: uid(), title: "Launch retro", date: day(3), startTime: "16:00", endTime: "17:00" },
    ],
  };
};

const load = (): AppState => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw);
  } catch {
    return seed();
  }
};

interface AppContextValue extends AppState {
  // tasks
  addTask: (t: Omit<Task, "id" | "createdAt" | "status"> & { status?: Status }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  // goals
  addGoal: (g: Omit<Goal, "id" | "createdAt" | "milestones" | "progress"> & { progress?: number }) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, mId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  // sessions
  addSession: (s: Omit<FocusSession, "id" | "completedAt">) => void;
  // notes
  addNote: (n: Omit<Note, "id" | "updatedAt" | "pinned"> & { pinned?: boolean }) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  // events
  addEvent: (e: Omit<CalendarEvent, "id">) => void;
  deleteEvent: (id: string) => void;
  // theme
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    addTask: (t) => update((s) => ({ ...s, tasks: [{ ...t, id: uid(), status: t.status ?? "todo", createdAt: today() }, ...s.tasks] })),
    updateTask: (id, patch) => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === id ? { ...x, ...patch } : x) })),
    deleteTask: (id) => update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
    toggleTask: (id) => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === id
      ? { ...x, status: x.status === "done" ? "todo" : "done", completedAt: x.status === "done" ? undefined : today() }
      : x) })),
    addGoal: (g) => update((s) => ({ ...s, goals: [{ ...g, id: uid(), milestones: [], progress: g.progress ?? 0, createdAt: today() }, ...s.goals] })),
    updateGoal: (id, patch) => update((s) => ({ ...s, goals: s.goals.map((x) => x.id === id ? { ...x, ...patch } : x) })),
    deleteGoal: (id) => update((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) })),
    toggleMilestone: (goalId, mId) => update((s) => ({
      ...s,
      goals: s.goals.map((g) => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map((m) => m.id === mId ? { ...m, done: !m.done } : m);
        const progress = milestones.length ? Math.round(milestones.filter((m) => m.done).length / milestones.length * 100) : g.progress;
        return { ...g, milestones, progress };
      })
    })),
    addMilestone: (goalId, title) => update((s) => ({
      ...s,
      goals: s.goals.map((g) => g.id === goalId ? { ...g, milestones: [...g.milestones, { id: uid(), title, done: false }] } : g)
    })),
    addSession: (s) => update((st) => ({ ...st, sessions: [{ ...s, id: uid(), completedAt: today() }, ...st.sessions] })),
    addNote: (n) => update((s) => ({ ...s, notes: [{ ...n, id: uid(), pinned: n.pinned ?? false, updatedAt: today() }, ...s.notes] })),
    updateNote: (id, patch) => update((s) => ({ ...s, notes: s.notes.map((x) => x.id === id ? { ...x, ...patch, updatedAt: today() } : x) })),
    deleteNote: (id) => update((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== id) })),
    togglePinNote: (id) => update((s) => ({ ...s, notes: s.notes.map((x) => x.id === id ? { ...x, pinned: !x.pinned } : x) })),
    addEvent: (e) => update((s) => ({ ...s, events: [...s.events, { ...e, id: uid() }] })),
    deleteEvent: (id) => update((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) })),
    toggleTheme: () => update((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
  }), [state, update]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
