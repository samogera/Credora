

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Info, FileSignature, Bot, MoreHorizontal, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PartnerPortfolio } from '@/components/partner-portfolio';
import { LoanActivity } from '@/components/loan-activity';
import { explainRiskFactors, ExplainRiskFactorsInput, ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleDecision = (id: string, decision: 'Approved' | 'Denied') => {
        setApplications(apps => apps.map(app => app.id === id ? { ...app, status: decision } : app));
        if (decision === 'Approved') {
            const appToSign = applications.find(a => a.id === id);
            if (appToSign) setSelectedApplication(appToSign);
        }
    };
    
    const handleSignContract = () => {
        setIsSigning(true);
        setTimeout(() => {
            setIsSigning(false);
            setSelectedApplication(null);
            toast({
                title: "Contract Signed!",
                description: "The loan agreement has been executed on the Soroban smart contract.",
            });
        }, 2000);
    }
    
    const handleViewProfile = (app: Application) => {
        setSelectedApplication(app);
        setIsProfileOpen(true);
        if (!app.aiExplanation) {
          handleExplainRisk(app.id);
        }
    };

    const handleExplainRisk = async (id: string) => {
        const appIndex = applications.findIndex(app => app.id === id);
        if (appIndex === -1) return;

        setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, isExplaining: true, aiExplanation: null } : app));
        setSelectedApplication(prev => prev ? {...prev, isExplaining: true, aiExplanation: null} : null);

        const appToExplain = applications[appIndex];
        const input: ExplainRiskFactorsInput = {
            score: appToExplain.score,
            stellarActivity: "Frequent transactions, holds various assets.",
            offChainSignals: "Consistent utility payments on time."
        };

        try {
            const result = await explainRiskFactors(input);
            setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, aiExplanation: result, isExplaining: false } : app));
            setSelectedApplication(prev => prev && prev.id === id ? {...prev, aiExplanation: result, isExplaining: false} : prev);

        } catch (error) {
            console.error("Error explaining risk factors:", error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not fetch AI risk explanation." });
            setApplications(apps => apps.map((app, index) => index === appIndex ? { ...app, isExplaining: false } : app));
            setSelectedApplication(prev => prev && prev.id === id ? {...prev, isExplaining: false} : prev);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 750) return "text-green-500";
        if (score >= 650) return "text-yellow-500";
        return "text-red-500";
    }
    
    const pendingApplications = applications.filter(a => a.status === 'Pending');

    return (
        <>
            <div className="space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Partner Dashboard</h1>
                <p className="text-muted-foreground">Review incoming loan applications, manage active loans, and track your portfolio performance.</p>
            </div>
            
            <PartnerPortfolio />

            <div className="grid gap-6 mt-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                        <CardDescription>Review new loan requests from prospective borrowers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Borrower</TableHead>
                                    <TableHead className="text-center">Credora Score</TableHead>
                                    <TableHead>Loan</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApplications.length > 0 ? pendingApplications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.user}</TableCell>
                                        <TableCell className={`text-center font-bold text-lg ${getScoreColor(app.score)}`}>{app.score}</TableCell>
                                        <TableCell>{app.loan}</TableCell>
                                        <TableCell className="text-right">{app.amount}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewProfile(app)}>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-green-600" onClick={() => handleDecision(app.id, 'Approved')}>Approve</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDecision(app.id, 'Denied')}>Deny</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No pending applications.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <LoanActivity />
            </div>
        
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                 <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><User /> Borrower Profile</DialogTitle>
                        <DialogDescription>{selectedApplication?.user} - {selectedApplication?.loan}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Credora Score</p>
                                <p className={`text-5xl font-bold ${getScoreColor(selectedApplication?.score || 0)}`}>{selectedApplication?.score}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Risk Band</p>
                                <Badge className="text-lg mt-2" variant={selectedApplication && selectedApplication.score > 700 ? 'default' : selectedApplication && selectedApplication.score > 600 ? 'secondary' : 'destructive'}>
                                    {selectedApplication && selectedApplication.score > 700 ? 'Low' : selectedApplication && selectedApplication.score > 600 ? 'Medium' : 'High'}
                                </Badge>
                            </div>
                        </div>
                        
                         <Card>
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center justify-between">
                                    <span>AI Risk Explanation</span>
                                     <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => selectedApplication && handleExplainRisk(selectedApplication.id)} disabled={selectedApplication?.isExplaining}>
                                        <Bot className={`h-4 w-4 ${selectedApplication?.isExplaining ? 'animate-pulse' : ''}`} />
                                    </Button>
                                 </CardTitle>
                             </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedApplication?.isExplaining ? <Skeleton className="h-16 w-full" /> : 
                                selectedApplication?.aiExplanation ? (
                                    <Alert className="text-sm">
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                           {selectedApplication.aiExplanation.explanation}
                                        </AlertDescription>
                                    </Alert>
                                ) :
                                 <p className="text-sm text-muted-foreground text-center py-2">Click the bot icon to generate an AI explanation.</p>
                                }
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base">Profile Data Sources</CardTitle>
                             </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>On-chain Stellar Activity</span></div>
                                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Verified Utility Bill Payments</span></div>
                                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Linked Off-chain Identifiers</span></div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                         <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>Close</Button>
                         <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setIsProfileOpen(false); handleDecision(selectedApplication!.id, 'Approved')}}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve Loan
                         </Button>
                    </DialogFooter>
                 </DialogContent>
            </Dialog>

             <Dialog open={!!selectedApplication && !isProfileOpen} onOpenChange={(isOpen) => !isOpen && setSelectedApplication(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSignature /> Finalize Loan Agreement
                        </DialogTitle>
                        <DialogDescription>
                            To finalize the loan for {selectedApplication?.user}, you must sign the Soroban smart contract. This creates a verifiable agreement on the Stellar network.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-sm">
                       <p>This action is irreversible and will transfer the loan amount to the user's wallet upon their final confirmation.</p>
                       <p className="font-medium text-destructive">You are signing to approve a loan of {selectedApplication?.amount} for {selectedApplication?.loan}.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedApplication(null)} disabled={isSigning}>Cancel</Button>
                        <Button onClick={handleSignContract} disabled={isSigning}>
                            {isSigning ? "Executing..." : "Sign & Execute Contract"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
