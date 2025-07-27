
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, FileSignature, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PartnerPortfolio } from '@/components/partner-portfolio';
import { LoanActivity } from '@/components/loan-activity';
import { explainRiskFactors, ExplainRiskFactorsInput, ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { Skeleton } from '@/components/ui/skeleton';

const initialApplications = [
  { id: 'app-001', user: 'Anonymous User #4B7A', score: 785, loan: 'Stablecoin Personal Loan', amount: '$10,000', status: 'Pending' },
  { id: 'app-002', user: 'Anonymous User #9F2C', score: 690, loan: 'AQUA-Backed Loan', amount: '$7,500', status: 'Pending' },
  { id: 'app-003', user: 'Anonymous User #1A5D', score: 810, loan: 'Ecosystem Grant Loan', amount: '$5,000', status: 'Approved' },
  { id: 'app-004', user: 'Anonymous User #C3E8', score: 560, loan: 'Small Business Loan', amount: '$50,000', status: 'Denied' },
];

type Application = typeof initialApplications[0] & {
    aiExplanation?: ExplainRiskFactorsOutput | null;
    isExplaining?: boolean;
};

export default function PartnerAdminPage() {
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    const handleDecision = (id: string, decision: 'Approved' | 'Denied') => {
        setApplications(apps => apps.map(app => app.id === id ? { ...app, status: decision } : app));
        if (decision === 'Approved') {
            setSelectedApplicationId(id);
        }
    };
    
    const handleSignContract = () => {
        setIsSigning(true);
        setTimeout(() => {
            setIsSigning(false);
            setSelectedApplicationId(null);
            toast({
                title: "Contract Signed!",
                description: "The loan agreement has been executed on the Soroban smart contract.",
            });
        }, 2000);
    }

    const handleExplainRisk = async (id: string) => {
        const appIndex = applications.findIndex(app => app.id === id);
        if (appIndex === -1) return;

        setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, isExplaining: true, aiExplanation: null } : app));

        const appToExplain = applications[appIndex];
        const input: ExplainRiskFactorsInput = {
            score: appToExplain.score,
            stellarActivity: "Frequent transactions, holds various assets.", // This would be fetched for the user
            offChainSignals: "Consistent utility payments on time." // This would be fetched for the user
        };

        try {
            const result = await explainRiskFactors(input);
            setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, aiExplanation: result, isExplaining: false } : app));
        } catch (error) {
            console.error("Error explaining risk factors:", error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not fetch AI risk explanation." });
            setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, isExplaining: false } : app));
        }
    };

    const getStatusVariant = (status: string) => {
        if (status === 'Approved') return 'default';
        if (status === 'Denied') return 'destructive';
        return 'secondary';
    }

    const getStatusColor = (status: string) => {
        if (status === 'Approved') return 'bg-green-500 hover:bg-green-600';
        if (status === 'Denied') return 'bg-red-500 hover:bg-red-600';
        return '';
    }

    const pendingApplications = applications.filter(a => a.status === 'Pending');

    return (
        <>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Partner Loan Dashboard</h1>
            <p className="text-muted-foreground">Review and manage incoming loan applications and your loan portfolio.</p>
        </div>
        <div className="space-y-6 mt-6">
            <PartnerPortfolio />
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                        <CardDescription>Review new loan requests from prospective borrowers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingApplications.length > 0 ? pendingApplications.map(app => (
                            <div key={app.id} className="rounded-lg border p-4 space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-lg">{app.user}</p>
                                        <p className="text-sm text-muted-foreground">{app.loan} for <span className="font-medium text-foreground">{app.amount}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Credora Score</p>
                                        <p className="text-2xl font-bold text-primary">{app.score}</p>
                                    </div>
                                </div>
                                
                                {app.isExplaining && <Skeleton className="h-12 w-full" />}
                                {app.aiExplanation && (
                                    <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md border">
                                        <p className="font-semibold text-foreground mb-1">AI Risk Insight:</p>
                                        {app.aiExplanation.explanation}
                                    </div>
                                )}
                                
                                <div className="flex gap-2 w-full flex-col sm:flex-row">
                                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleDecision(app.id, 'Approved')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDecision(app.id, 'Denied')}>
                                        <XCircle className="mr-2 h-4 w-4" /> Deny
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleExplainRisk(app.id)} disabled={app.isExplaining}>
                                        <Bot className={`mr-2 h-4 w-4 ${app.isExplaining ? 'animate-pulse' : ''}`} />
                                        {app.isExplaining ? "Analyzing..." : "Explain Risk"}
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No pending applications.</p>
                        )}
                    </CardContent>
                </Card>
                <LoanActivity />
            </div>
            
        </div>
         <Dialog open={!!selectedApplicationId} onOpenChange={(isOpen) => !isOpen && setSelectedApplicationId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSignature /> Finalize Loan Agreement
                    </DialogTitle>
                    <DialogDescription>
                        To finalize the loan for {applications.find(a => a.id === selectedApplicationId)?.user}, you must sign the Soroban smart contract. This creates a verifiable agreement on the Stellar network.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm">
                   <p>This action is irreversible and will transfer the loan amount to the user's wallet upon their final confirmation.</p>
                   <p className="font-medium text-destructive">You are signing to approve a loan of {applications.find(a => a.id === selectedApplicationId)?.amount} for {applications.find(a => a.id === selectedApplicationId)?.loan}.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedApplicationId(null)} disabled={isSigning}>Cancel</Button>
                    <Button onClick={handleSignContract} disabled={isSigning}>
                        {isSigning ? "Executing..." : "Sign & Execute Contract"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
