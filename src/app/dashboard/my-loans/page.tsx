

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
import { CreditCard, Landmark, Wallet, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function MyLoansPage() {
    const { loanActivity, user } = useContext(UserContext);
    const [selectedLoan, setSelectedLoan] = useState<LoanActivityItem | null>(null);
    const [isRepaying, setIsRepaying] = useState(false);

    const userLoans = loanActivity.filter(loan => loan.userId === user?.uid);

    const handleRepayClick = (loan: LoanActivityItem) => {
        setSelectedLoan(loan);
    }

    const handlePayment = () => {
        if (!selectedLoan) return;
        setIsRepaying(true);
        toast({
            title: "Submitting to Soroban...",
            description: "Your repayment transaction is being sent to the LoanAgreement contract.",
        });

        setTimeout(() => {
            setIsRepaying(false);
            setSelectedLoan(null);
            toast({
                title: "Payment Successful!",
                description: `Your repayment for the loan from ${selectedLoan.partnerName} has been confirmed on-chain.`,
            });
            // Here you would add the logic to update the loan's repaid amount in the database
        }, 2000);
    }

    const getStatusVariant = (status: string) => {
        if (status === 'Active') return 'default';
        if (status === 'Paid Off') return 'secondary';
        return 'destructive';
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
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Repayment Progress</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userLoans.length > 0 ? userLoans.map(loan => {
                                    const repaid = loan.repaid || 0;
                                    const progress = (repaid / loan.amount) * 100;
                                    return (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium">{loan.partnerName}</TableCell>
                                            <TableCell>${loan.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={progress} className="w-[150px]" />
                                                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">${repaid.toLocaleString()} / ${loan.amount.toLocaleString()}</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleRepayClick(loan)} disabled={loan.status !== 'Active'}>
                                                    Make Payment
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">You have no loans.</TableCell>
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
                            Choose your preferred method to repay your loan from {selectedLoan?.partnerName}. Your payment will be a USDC transfer on Stellar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-center text-lg">
                            Amount Due: <span className="font-bold text-primary">${(selectedLoan ? selectedLoan.amount - (selectedLoan.repaid || 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-20 flex-col gap-2"><Wallet className="h-6 w-6" />Stellar Wallet</Button>
                            <Button variant="outline" className="h-20 flex-col gap-2"><CreditCard className="h-6 w-6" />Credit/Debit Card</Button>
                            <Button variant="outline" className="h-20 flex-col gap-2"><Landmark className="h-6 w-6" />PayPal</Button>
                            <Button variant="outline" className="h-20 flex-col gap-2"><Smartphone className="h-6 w-6" />Mobile Money</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedLoan(null)} disabled={isRepaying}>Cancel</Button>
                        <Button onClick={handlePayment} disabled={isRepaying}>
                            {isRepaying ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
