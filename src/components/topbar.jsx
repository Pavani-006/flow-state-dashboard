import { Bell, Moon, Search, Sun, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/store/app-store";
import { useEffect, useState } from "react";
import { CommandPalette } from "@/components/command-palette";

export function Topbar() {
  const { theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b glass px-3 md:px-5">
        <SidebarTrigger />
        <div className="relative ml-2 hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            onClick={() => setOpen(true)}
            placeholder="Search or jump to…"
            className="h-9 cursor-pointer pl-9 pr-16 bg-muted/40"
          />

          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8 ring-2 ring-border">
            <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
              PA
            </AvatarFallback>
          </Avatar>
          <span className="ml-1 hidden text-sm font-medium md:inline">Pavani</span>
        </div>
      </header>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
