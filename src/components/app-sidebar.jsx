import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  Timer,
  Target,
  BarChart3,
  Calendar,
  StickyNote,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: ListChecks },
  { title: "Focus", url: "/focus", icon: Timer },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Notes", url: "/notes", icon: StickyNote },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Flowdesk</span>
              <span className="text-[10px] text-muted-foreground">Productivity OS</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === "/" ? path === "/" : path.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="rounded-xl border bg-gradient-to-br from-accent/40 to-transparent p-3 text-xs">
            <p className="font-medium">Pro tip</p>
            <p className="mt-1 text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd> to open the
              command palette.
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
