import { AppSidebar } from "@/components/appSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HabitsProvider } from "@/lib/habits-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HabitsProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 min-h-screen overflow-auto ">
          <div className="sticky top-0 z-10 px-4 py-2">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </HabitsProvider>
  );
}
