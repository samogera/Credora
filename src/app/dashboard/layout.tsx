import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
import { ChatAssistant } from "@/components/chat-assistant";
import { SorobanMockBanner } from "@/components/soroban-mock-banner";

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  return (
      <SidebarProvider>
        <SorobanMockBanner />
        <Sidebar collapsible="icon">
          <SidebarNav />
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen w-full flex-col pt-10">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
              {children}
            </main>
          </div>
          <ChatAssistant />
        </SidebarInset>
      </SidebarProvider>
  );
}
