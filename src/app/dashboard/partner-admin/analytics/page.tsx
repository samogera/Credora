
import { AnalyticsCharts } from "@/components/analytics-charts";
import { PartnerPortfolio } from "@/components/partner-portfolio";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Visualize your portfolio performance and gain insights into your lending activities.
        </p>
      </div>
      
      <PartnerPortfolio />

      <AnalyticsCharts />

    </div>
  );
}
