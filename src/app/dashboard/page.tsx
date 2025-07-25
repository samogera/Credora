import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
import { CreditScore } from "@/components/credit-score";
import { DataSources } from "@/components/data-sources";
import { RiskFactors } from "@/components/risk-factors";
import { PartnerView } from "@/components/partner-view";


export default function Dashboard() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <CreditScore />
              <DataSources />
              <RiskFactors />
              <PartnerView />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
