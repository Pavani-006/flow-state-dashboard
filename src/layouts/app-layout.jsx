import { Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/store/app-store";

export function AppLayout() {
  return (
    <AppProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/30">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-6 md:px-8">
              <div className="mx-auto w-full max-w-7xl animate-fade-in">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </AppProvider>
  );
}
