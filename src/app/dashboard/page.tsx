
"use client";

import { useContext } from 'react';
import { CreditScore } from "@/components/credit-score";
import { DataSources } from "@/components/data-sources";
import { RiskFactors } from "@/components/risk-factors";
import { LoanRecommendations } from "@/components/loan-recommendations";
import { ApplicationStatus } from "@/components/application-status";
import { UserContext } from '@/context/user-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { score, setScore } = useContext(UserContext);

  if (score === null) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
             <div className="md:col-span-2">
                <Card className="text-center shadow-lg">
                    <CardHeader>
                        <CardTitle>Welcome to Credora!</CardTitle>
                        <CardDescription>Let's calculate your decentralized credit score.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                                To get started, connect your first data source. Your Stellar wallet is a great place to begin and is required to unlock loan applications.
                            </AlertDescription>
                        </Alert>
                        <Button asChild>
                            <Link href="/dashboard/data-sources">Connect Data Source</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <DataSources />
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
            <CreditScore score={score} setScore={setScore} />
        </div>
        <div className="md:col-span-2 space-y-6">
            <LoanRecommendations score={score} />
            <ApplicationStatus />
        </div>
        <div className="space-y-6 md:col-span-2 xl:col-span-1">
            <DataSources />
            <RiskFactors score={score} />
        </div>
    </div>
  );
}
