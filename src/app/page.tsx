import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
import { CreditScore } from "@/components/credit-score";
import { DataSources } from "@/components/data-sources";
import { RiskFactors } from "@/components/risk-factors";
import { PartnerView } from "@/components/partner-view";


export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <CreditScore />
                <RiskFactors />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <DataSources />
                <PartnerView />
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
