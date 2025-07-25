
"use client";

import { useState } from 'react';
import { CreditScore } from "@/components/credit-score";
import { DataSources } from "@/components/data-sources";
import { RiskFactors } from "@/components/risk-factors";
import { PartnerView } from "@/components/partner-view";
import { LoanRecommendations } from "@/components/loan-recommendations";
import { ApplicationStatus } from "@/components/application-status";

export default function Dashboard() {
  const [score, setScore] = useState(785);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <CreditScore score={score} setScore={setScore} />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <LoanRecommendations score={score} />
            <ApplicationStatus />
        </div>
        <div className="space-y-6">
            <DataSources />
            <RiskFactors score={score} />
            <PartnerView />
        </div>
    </div>
  );
}
