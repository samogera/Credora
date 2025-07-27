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
import { CheckCircle, XCircle, FileSignature } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PartnerPortfolio } from '@/components/partner-portfolio';
import { LoanActivity } from '@/components/loan-activity';

const initialApplications = [
  { id: 'app-001', user: 'Anonymous User #4B7A', score: 785, loan: 'Stablecoin Personal Loan', amount: '$10,000', status: 'Pending' },
  { id: 'app-002', user: 'Anonymous User #9F2C', score: 690, loan: 'AQUA-Backed Loan', amount: '$7,500', status: 'Pending' },
  { id: 'app-003', user: 'Anonymous User #1A5D', score: 810, loan: 'Ecosystem Grant Loan', amount: '$5,000', status: 'Approved' },
  { id: 'app-004', user: 'Anonymous User #C3E8', score: 560, loan: 'Small Business Loan', amount: '$50,000', status: 'Denied' },
];

export default function PartnerAdminPage() {
    const [applications, setApplications] = useState(initialApplications);
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
    const processedApplications = applications.filter(a => a.status !== 'Pending');

    return (
        <>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Partner Loan Dashboard</h1>
            <p className="text-muted-foreground">Review and manage incoming loan applications and your loan portfolio.</p>
        </div>
        <div className="space-y-6 mt-6">
            <PartnerPortfolio />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                        <CardDescription>Review new loan requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingApplications.map(app => (
                            <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
                                <div>
                                    <p className="font-semibold">{app.user} - <span className="text-primary">{app.score}</span></p>
                                    <p className="text-sm text-muted-foreground">{app.loan} for {app.amount}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button size="sm" variant="outline" className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => handleDecision(app.id, 'Approved')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handleDecision(app.id, 'Denied')}>
                                        <XCircle className="mr-2 h-4 w-4" /> Deny
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingApplications.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No pending applications.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Processed Applications</CardTitle>
                        <CardDescription>View your recently processed applications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {processedApplications.map(app => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-semibold">{app.user} - <span className="text-primary">{app.score}</span></p>
                                    <p className="text-sm text-muted-foreground">{app.loan} for {app.amount}</p>
                                </div>
                                <Badge variant={getStatusVariant(app.status)} className={getStatusColor(app.status)}>{app.status}</Badge>
                            </div>
                        ))}
                         {processedApplications.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No processed applications.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <LoanActivity />
        </div>
         <Dialog open={!!selectedApplicationId} onOpenChange={(isOpen) => !isOpen && setSelectedApplicationId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSignature /> Finalize Loan Agreement
                    </DialogTitle>
                    <DialogDescription>
                        To finalize the loan for User #{selectedApplicationId?.slice(-4)}, you must sign the Soroban smart contract. This creates a legally binding agreement on the Stellar network.
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
