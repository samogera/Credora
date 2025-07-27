

"use client";

import { useState, useContext } from 'react';
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
import { UserContext, Application } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PartnerAdminPage() {
    const { applications, updateApplicationStatus, addNotification } = useContext(UserContext);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleDecision = (appToUpdate: Application, decision: 'Approved' | 'Denied') => {
        updateApplicationStatus(appToUpdate.id, decision);
        
        addNotification({
            for: 'user',
            userId: appToUpdate.userId,
            type: decision === 'Approved' ? 'approval' : 'denial',
            title: `Loan ${decision}`,
            message: `Your application for the ${appToUpdate.loan.name} for $${appToUpdate.amount.toLocaleString()} has been ${decision.toLowerCase()}.`,
            read: false,
        });

        if (decision === 'Approved') {
            setSelectedApplication({...appToUpdate, status: 'Approved' });
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
        const appToExplain = applications.find(app => app.id === id);
        if (!appToExplain) return;

        const updatedApp = { ...appToExplain, isExplaining: true };
        setSelectedApplication(updatedApp);
        // Also update the main list to show loading state if the user closes and reopens the dialog
        setApplications(apps => apps.map(a => a.id === id ? updatedApp : a));


        const input: ExplainRiskFactorsInput = {
            score: appToExplain.score,
            stellarActivity: "Frequent transactions, holds various assets.",
            offChainSignals: "Consistent utility payments on time."
        };

        try {
            const result = await explainRiskFactors(input);
            const finalApp = { ...updatedApp, aiExplanation: result, isExplaining: false };
            setSelectedApplication(finalApp);
            setApplications(apps => apps.map(a => a.id === id ? finalApp : a));

        } catch (error) {
            console.error("Error explaining risk factors:", error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not fetch AI risk explanation." });
            const errorApp = { ...updatedApp, isExplaining: false };
            setSelectedApplication(errorApp);
            setApplications(apps => apps.map(a => a.id === id ? errorApp : a));
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
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage src={app.user.avatarUrl || ''} alt={app.user.displayName} />
                                                <AvatarFallback>
                                                    <User />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{app.user.displayName}</span>
                                        </TableCell>
                                        <TableCell className={`text-center font-bold text-lg ${getScoreColor(app.score)}`}>{app.score}</TableCell>
                                        <TableCell>{app.loan.name}</TableCell>
                                        <TableCell className="text-right">${app.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewProfile(app)}>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-green-600" onClick={() => handleDecision(app, 'Approved')}>Approve</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDecision(app, 'Denied')}>Deny</DropdownMenuItem>
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
                        <DialogTitle className="flex items-center gap-2">
                             <Avatar>
                                <AvatarImage src={selectedApplication?.user.avatarUrl || ''} alt={selectedApplication?.user.displayName} />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                            Borrower Profile
                        </DialogTitle>
                        <DialogDescription>{selectedApplication?.user.displayName} - {selectedApplication?.loan.name}</DialogDescription>
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
                         <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setIsProfileOpen(false); selectedApplication && handleDecision(selectedApplication, 'Approved')}}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve Loan
                         </Button>
                    </DialogFooter>
                 </DialogContent>
            </Dialog>

             <Dialog open={!!selectedApplication && !isProfileOpen && selectedApplication.status === 'Approved'} onOpenChange={(isOpen) => !isOpen && setSelectedApplication(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSignature /> Finalize Loan Agreement
                        </DialogTitle>
                        <DialogDescription>
                            To finalize the loan for {selectedApplication?.user.displayName}, you must sign the Soroban smart contract. This creates a verifiable agreement on the Stellar network.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-sm">
                       <p>This action is irreversible and will transfer the loan amount to the user's wallet upon their final confirmation.</p>
                       <p className="font-medium text-destructive">You are signing to approve a loan of ${selectedApplication?.amount.toLocaleString()} for {selectedApplication?.loan.name}.</p>
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
