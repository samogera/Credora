
"use client";

import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { UserContext, LoanActivityItem } from '@/context/user-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { repayLoan } from '@/lib/soroban-mock';
import Loading from '../loading';

export default function MyLoansPage() {
    const { loanActivity, user, refreshLoanActivity, dataLoading } = useContext(UserContext);
    const [selectedLoan, setSelectedLoan] = useState<LoanActivityItem | null>(null);
    const [isRepaying, setIsRepaying] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState<number | string>('');

    const userLoans = loanActivity.filter(loan => loan.userId === user?.uid);

    const handleRepayClick = (loan: LoanActivityItem) => {
        if (loan.sorobanLoanId === undefined || loan.sorobanLoanId === null || isNaN(loan.sorobanLoanId)) {
             toast({
                title: "Repayment Error",
                description: `This loan does not have a valid on-chain ID. Please contact support.`,
                variant: 'destructive',
            });
            return;
        }
        setSelectedLoan(loan);
        const interest = loan.interestAccrued || 0;
        const repaid = loan.repaid || 0;
        const remaining = loan.amount + interest - repaid;
        setRepaymentAmount(remaining > 0 ? remaining.toFixed(2) : '0.00');
    }

    const handlePayment = async () => {
        if (!selectedLoan || typeof selectedLoan.sorobanLoanId !== 'number' || isNaN(selectedLoan.sorobanLoanId)) {
             toast({
                title: "Repayment Failed",
                description: "Selected loan has an invalid ID. Cannot proceed.",
                variant: 'destructive',
            });
            return;
        }
        
        const loanIdToRepay = selectedLoan.sorobanLoanId;
        
        setIsRepaying(true);
        toast({
            title: "Submitting to Soroban...",
            description: "Your repayment transaction is being sent to the LoanAgreement contract.",
        });

        try {
            const txHash = await repayLoan(loanIdToRepay, Number(repaymentAmount));

            await refreshLoanActivity();

            setIsRepaying(false);
            setSelectedLoan(null);
            setRepaymentAmount('');

            toast({
                title: "Payment Successful!",
                description: `Repayment of $${Number(repaymentAmount).toLocaleString()} for ${selectedLoan.partnerName} confirmed. Mock TX: ${txHash.substring(0, 20)}...`,
            });

        } catch(e: any) {
            console.error("Mock Soroban error:", e);
            toast({
                title: "Repayment Failed",
                description: e.message || "Could not process repayment via mock Soroban.",
                variant: 'destructive',
            })
            setIsRepaying(false);
        }
    }

    const getStatusVariant = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'active') return 'default';
        if (lowerStatus === 'repaid' || lowerStatus === 'paid off') return 'secondary';
        if (lowerStatus === 'delinquent') return 'destructive';
        return 'destructive';
    }
    
    const getStatusBadgeColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'active') return 'bg-blue-500 hover:bg-blue-600';
        if (lowerStatus === 'repaid' || lowerStatus === 'paid off') return 'bg-green-500 hover:bg-green-600';
        if (lowerStatus === 'delinquent') return 'bg-yellow-500 text-black hover:bg-yellow-600';
        return '';
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
    }
    
    if (dataLoading) {
        return <Loading />
    }

    return (
        <>
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
                    <p className="text-muted-foreground">Track your active loans, manage repayments, and view your loan history.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Overview</CardTitle>
                        <CardDescription>A summary of your current and past loans.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lender</TableHead>
                                    <TableHead>Principal Amount</TableHead>
                                    <TableHead>Total Repayment</TableHead>
                                    <TableHead>Repayment Progress</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userLoans.length > 0 ? userLoans.map(loan => {
                                    const interest = loan.interestAccrued || 0;
                                    const totalToRepay = loan.amount + interest;
                                    const repaid = loan.repaid || 0;
                                    const progress = totalToRepay > 0 ? (repaid / totalToRepay) * 100 : 0;
                                    const isPaidOff = (loan.status.toLowerCase() === 'repaid' || loan.status.toLowerCase() === 'paid off') || repaid >= totalToRepay;
                                    return (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium">{loan.partnerName}</TableCell>
                                            <TableCell>{formatCurrency(loan.amount)}</TableCell>
                                            <TableCell>{formatCurrency(totalToRepay)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={progress} className="w-[150px]" />
                                                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(repaid)} / {formatCurrency(totalToRepay)}</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(loan.status)} className={getStatusBadgeColor(isPaidOff ? 'Paid Off' : loan.status)}>{isPaidOff ? 'Paid Off' : 'Active'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleRepayClick(loan)} disabled={isPaidOff}>
                                                    Make Payment
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">You have no loans.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={!!selectedLoan} onOpenChange={(isOpen) => !isOpen && setSelectedLoan(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make a Repayment</DialogTitle>
                        <DialogDescription>
                            Enter the amount you wish to repay for your loan from {selectedLoan?.partnerName}. Your payment will be a simulated USDC transfer on Stellar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                       <div className="grid gap-2 text-center">
                            <p className="text-sm text-muted-foreground">Amount Remaining</p>
                            <p className="font-bold text-primary text-2xl">
                                {formatCurrency(selectedLoan ? (selectedLoan.amount + (selectedLoan.interestAccrued || 0) - (selectedLoan.repaid || 0)) : 0)}
                            </p>
                       </div>
                        <div className="space-y-2">
                            <Label htmlFor="repayment-amount">Repayment Amount</Label>
                            <Input 
                                id="repayment-amount"
                                type="number"
                                value={repaymentAmount || ''}
                                onChange={(e) => setRepaymentAmount(e.target.value)}
                                max={selectedLoan ? (selectedLoan.amount + (selectedLoan.interestAccrued || 0) - (selectedLoan.repaid || 0)).toFixed(2) : '0'}
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedLoan(null)} disabled={isRepaying}>Cancel</Button>
                        <Button onClick={handlePayment} disabled={isRepaying || !repaymentAmount || Number(repaymentAmount) <= 0}>
                            {isRepaying ? 'Processing...' : `Pay ${formatCurrency(Number(repaymentAmount) || 0)}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
