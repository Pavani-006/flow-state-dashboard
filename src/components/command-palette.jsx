import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  Timer,
  Target,
  BarChart3,
  Calendar,
  StickyNote,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: ListChecks },
  { title: "Focus timer", url: "/focus", icon: Timer },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Notes", url: "/notes", icon: StickyNote },
];

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((it) => (
            <CommandItem
              key={it.url}
              onSelect={() => {
                navigate({ to: it.url });
                onOpenChange(false);
              }}
            >
              <it.icon className="mr-2 h-4 w-4" />
              {it.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
