

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
import { CheckCircle, Info, Bot, MoreHorizontal, User, XCircle, Wallet, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PartnerPortfolio } from '@/components/partner-portfolio';
import { LoanActivity } from '@/components/loan-activity';
import { explainRiskFactors, ExplainRiskFactorsInput, ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserContext, Application } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PartnerAdminPage() {
    const { applications, updateApplicationStatus, dataLoading } = useContext(UserContext);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleDecision = (appToUpdate: Application, decision: 'Approved' | 'Denied') => {
        updateApplicationStatus(appToUpdate.id, decision);
        if (decision === 'Approved') {
            toast({
                title: `Application Approved`,
                description: `The user has been notified. Funds will be disbursed once they sign the contract.`
            });
        } else {
             toast({
                title: `Application Denied`,
                description: `The application from ${appToUpdate.user?.displayName || 'Unknown User'} has been denied.`
            });
        }
    };
    
    const handleViewProfile = (app: Application) => {
        setSelectedApplication(app);
        setIsProfileOpen(true);
        if (!app.aiExplanation) {
          handleExplainRisk(app);
        }
    };

    const handleVerifyOnSoroban = async (walletAddress: string) => {
        toast({
            title: "Verifying Score...",
            description: `Fetching latest score for wallet ${walletAddress.substring(0, 8)}... from the Soroban contract.`
        });
        // Mock function (replace later with real Soroban SDK)
        const getScore = async (wallet: string) => {
            console.log(`Getting score for ${wallet}`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            return { score: 720, risk: "B", onChain: true, tx: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` }; // Simulate on-chain fetch
        };

        try {
            const sorobanResult = await getScore(walletAddress);
             toast({
                title: "Verification Complete!",
                description: `On-chain score: ${sorobanResult.score}. Tx: ${sorobanResult.tx.substring(0,12)}...`
            });
             if(selectedApplication){
                setSelectedApplication({...selectedApplication, score: sorobanResult.score });
            }
        } catch(e) {
            toast({ variant: 'destructive', title: "Verification Failed", description: "Could not connect to Soroban RPC." });
        }
    }

    const handleExplainRisk = async (appToExplain: Application) => {
        if (!appToExplain) return;

        const updatedApp = { ...appToExplain, isExplaining: true };
        setSelectedApplication(updatedApp);
        
        const input: ExplainRiskFactorsInput = {
            score: appToExplain.score,
            stellarActivity: "Frequent transactions, holds various assets.",
            offChainSignals: "Consistent utility payments on time."
        };

        try {
            const result = await explainRiskFactors(input);
            const finalApp = { ...updatedApp, aiExplanation: result, isExplaining: false };
            setSelectedApplication(finalApp);
        } catch (error) {
            console.error("Error explaining risk factors:", error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not fetch AI risk explanation." });
            const errorApp = { ...updatedApp, isExplaining: false };
            setSelectedApplication(errorApp);
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
                                {dataLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Skeleton className="h-10 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ) : pendingApplications.length > 0 ? pendingApplications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage src={app.user?.avatarUrl || ''} alt={app.user?.displayName || 'Unknown User'} />
                                                <AvatarFallback>
                                                    <User />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{app.user?.displayName || 'Unknown User'}</span>
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
                                                    <DropdownMenuItem className="text-green-600 focus:text-green-600" onClick={() => handleDecision(app, 'Approved')}>Approve</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDecision(app, 'Denied')}>Deny</DropdownMenuItem>
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
                 <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                             <Avatar>
                                <AvatarImage src={selectedApplication?.user?.avatarUrl || ''} alt={selectedApplication?.user?.displayName || 'Unknown User'} />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                            Borrower Profile
                        </DialogTitle>
                        <DialogDescription>{selectedApplication?.user?.displayName || 'Unknown User'} - {selectedApplication?.loan.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <Card className="pt-6 relative">
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Credora Score (On-Chain)</p>
                                    <p className={`text-5xl font-bold ${getScoreColor(selectedApplication?.score || 0)}`}>{selectedApplication?.score}</p>
                                </CardContent>
                                <Button size="sm" className="absolute top-2 right-2 h-7" variant="secondary" onClick={() => handleVerifyOnSoroban(selectedApplication?.user?.walletAddress || '')} disabled={!selectedApplication?.user?.walletAddress}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify
                                </Button>
                            </Card>
                             <Card className="pt-6">
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Risk Band</p>
                                    <Badge className="text-lg mt-4" variant={selectedApplication && selectedApplication.score > 700 ? 'default' : selectedApplication && selectedApplication.score > 600 ? 'secondary' : 'destructive'}>
                                        {selectedApplication && selectedApplication.score > 700 ? 'Low' : selectedApplication && selectedApplication.score > 600 ? 'Medium' : 'High'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                        
                         <Card>
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center justify-between">
                                    <span>AI Risk Explanation</span>
                                     <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => selectedApplication && handleExplainRisk(selectedApplication)} disabled={selectedApplication?.isExplaining}>
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

                        <div className="grid grid-cols-2 gap-4">
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
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Application Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="space-y-1">
                                        <Label>Loan Amount</Label>
                                        <Input disabled value={`$${selectedApplication?.amount.toLocaleString()}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Wallet Address</Label>
                                        <Input disabled value={selectedApplication?.user?.walletAddress || "Not Provided"} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>Close</Button>
                         <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setIsProfileOpen(false); selectedApplication && handleDecision(selectedApplication, 'Approved')}}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve Loan
                         </Button>
                         <Button variant="destructive" onClick={() => { setIsProfileOpen(false); selectedApplication && handleDecision(selectedApplication, 'Denied')}}>
                            <XCircle className="mr-2 h-4 w-4" /> Deny Loan
                         </Button>
                    </DialogFooter>
                 </DialogContent>
            </Dialog>

        </>
    );
}
