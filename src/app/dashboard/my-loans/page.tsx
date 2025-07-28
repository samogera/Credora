
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
// TODO: REPLACE WITH REAL SOROBAN CALL
import { repayLoan, getLoan } from '@/lib/soroban-mock';

export default function MyLoansPage() {
    const { loanActivity, user, refreshLoanActivity } = useContext(UserContext);
    const [selectedLoan, setSelectedLoan] = useState<LoanActivityItem | null>(null);
    const [isRepaying, setIsRepaying] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState(0);

    const userLoans = loanActivity.filter(loan => loan.userId === user?.uid);

    const handleRepayClick = (loan: LoanActivityItem) => {
        const remaining = loan.amount - (loan.repaid || 0) + (loan.interestAccrued || 0);
        setRepaymentAmount(remaining);
        setSelectedLoan(loan);
    }

    const handlePayment = async () => {
        if (!selectedLoan || repaymentAmount <= 0) return;
        setIsRepaying(true);
        toast({
            title: "Submitting to Soroban...",
            description: "Your repayment transaction is being sent to the LoanAgreement contract.",
        });

        try {
            const loanIdToRepay = parseInt(selectedLoan.sorobanLoanId!.split('-').pop() || '0', 10);
            
            // TODO: REPLACE WITH REAL SOROBAN CALL
            const txHash = await repayLoan(loanIdToRepay, repaymentAmount);

            // Refresh the loan state from the mock DB to show progress
            await refreshLoanActivity();

            // Check if the loan is fully repaid
            const updatedLoan = await getLoan(loanIdToRepay);

            setIsRepaying(false);
            setSelectedLoan(null);

            toast({
                title: "Payment Successful!",
                description: `Repayment of $${repaymentAmount.toLocaleString()} for ${selectedLoan.partnerName} confirmed. Mock TX: ${txHash.substring(0, 20)}...`,
            });
            
            if (updatedLoan?.status === 'repaid') {
                 toast({
                    title: "Loan Paid Off!",
                    description: `Congratulations! Your loan from ${selectedLoan.partnerName} is fully repaid.`,
                });
            }

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
        if (status === 'Active' || status === 'active') return 'default';
        if (status === 'Paid Off' || status === 'repaid') return 'secondary';
        return 'destructive';
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
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
                                    const progress = (repaid / totalToRepay) * 100;
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
                                                <Badge variant={getStatusVariant(loan.status)}>{loan.status === 'repaid' ? 'Paid Off' : 'Active'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleRepayClick(loan)} disabled={loan.status === 'Paid Off' || loan.status === 'repaid'}>
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
                                {selectedLoan ? formatCurrency(selectedLoan.amount + (selectedLoan.interestAccrued || 0) - (selectedLoan.repaid || 0)) : '$0.00'}
                            </p>
                       </div>
                        <div className="space-y-2">
                            <Label htmlFor="repayment-amount">Repayment Amount</Label>
                            <Input 
                                id="repayment-amount"
                                type="number"
                                value={repaymentAmount || 0}
                                onChange={(e) => setRepaymentAmount(parseFloat(e.target.value))}
                                max={selectedLoan ? selectedLoan.amount + (selectedLoan.interestAccrued || 0) - (selectedLoan.repaid || 0) : 0}
                                min="0"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedLoan(null)} disabled={isRepaying}>Cancel</Button>
                        <Button onClick={handlePayment} disabled={isRepaying || repaymentAmount <= 0}>
                            {isRepaying ? 'Processing...' : `Pay ${formatCurrency(repaymentAmount)}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
