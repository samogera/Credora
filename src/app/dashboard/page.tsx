import { CreditScore } from "@/components/credit-score";
import { DataSources } from "@/components/data-sources";
import { RiskFactors } from "@/components/risk-factors";
import { PartnerView } from "@/components/partner-view";
import { LoanRecommendations } from "@/components/loan-recommendations";
import { ApplicationStatus } from "@/components/application-status";

export default function Dashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <CreditScore />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <LoanRecommendations />
            <ApplicationStatus />
        </div>
        <div className="space-y-6">
            <DataSources />
            <RiskFactors />
            <PartnerView />
        </div>
    </div>
  );
}
