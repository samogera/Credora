
"use client";

import { useState, useContext, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserContext, Application } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getScore } from '@/lib/soroban-mock';

export default function PartnerAdminPage() {
    const { applications, updateApplicationStatus, dataLoading } = useContext(UserContext);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleDecision = (appToUpdate: Application, decision: 'Approved' | 'Denied') => {
        updateApplicationStatus(appToUpdate.id, decision, appToUpdate.user?.walletAddress, appToUpdate.amount);
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
    };

    const handleVerifyOnSoroban = async (walletAddress: string) => {
        toast({
            title: "Verifying Score...",
            description: `Fetching latest score for wallet ${walletAddress.substring(0, 8)}... from the mock Soroban contract.`
        });
        
        try {
            const sorobanResult = await getScore(walletAddress);
             toast({
                title: "Verification Complete!",
                description: `Mock on-chain score: ${sorobanResult.value}, Risk: ${sorobanResult.riskBand}.`
            });
             if(selectedApplication){
                // Update score in the dialog for immediate feedback
                setSelectedApplication({...selectedApplication, score: sorobanResult.value });
            }
        } catch(e: any) {
            console.error("Mock Soroban error:", e);
            toast({ variant: 'destructive', title: "Verification Failed", description: e.message || "Could not connect to Soroban RPC." });
        }
    }

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
                                    <Bot className="h-5 w-5 text-primary" />
                                 </CardTitle>
                             </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedApplication?.aiExplanation ? (
                                    <Alert className="text-sm">
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                           {selectedApplication.aiExplanation.explanation}
                                        </AlertDescription>
                                    </Alert>
                                ) :
                                 <p className="text-sm text-muted-foreground text-center py-2">AI explanation is being generated...</p>
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
