

"use client";

import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
import { UserContext, LoanProduct, Application } from '@/context/user-context';
import { Alert, AlertDescription } from '@/components/ui/alert';


export default function PartnersPage() {
    const { partners, addApplication, user, score } = useContext(UserContext);
    const [selectedLoan, setSelectedLoan] = useState<LoanProduct & { partnerName: string } | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [customAmount, setCustomAmount] = useState<number>(1000);
    
    useEffect(() => {
        if (selectedLoan) {
            setCustomAmount(1000); // Reset amount when a new loan is selected
        }
    }, [selectedLoan]);

    const handleApplyClick = (product: LoanProduct, partnerName: string) => {
        setSelectedLoan({ ...product, partnerName });
        setCustomAmount(Math.min(1000, product.maxAmount));
    };

    const handleApplicationSubmit = () => {
        if (!selectedLoan || !user) return;
        setIsApplying(true);

        const newApplication: Omit<Application, 'id' | 'user' | 'userId' | 'userAvatar' | 'createdAt' | 'score' | 'partnerId'> = {
            loan: {
                id: selectedLoan.id,
                name: selectedLoan.name,
                partnerName: selectedLoan.partnerName,
                interestRate: parseFloat(selectedLoan.rate),
                term: selectedLoan.term
            },
            amount: customAmount,
            status: 'Pending' as const,
        };

        addApplication(newApplication);

        setTimeout(() => {
            setIsApplying(false);
            setSelectedLoan(null);
            toast({
                title: "Application Submitted!",
                description: `Your loan application for $${customAmount.toLocaleString()} has been sent. Track its status on your dashboard.`,
            });
        }, 1500);
    }
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    
    const canApply = user && score !== null;

    const { monthlyPayment, totalRepayment, totalInterest } = useMemo(() => {
        if (!selectedLoan) return { monthlyPayment: 0, totalRepayment: 0, totalInterest: 0 };
        const rate = parseFloat(selectedLoan.rate) / 100 / 12; // Monthly interest rate
        const term = selectedLoan.term;
        const principal = customAmount;

        if (rate === 0) { // Simple loan calculation if interest is 0
            return {
                monthlyPayment: principal / term,
                totalRepayment: principal,
                totalInterest: 0
            }
        }
        
        const monthly = principal * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1);
        const total = monthly * term;
        const interest = total - principal;
        
        return {
            monthlyPayment: monthly,
            totalRepayment: total,
            totalInterest: interest,
        };
    }, [customAmount, selectedLoan]);

  return (
    <>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Lending Partners</h1>
            <p className="text-muted-foreground">Browse loan products from trusted partners in the Credora ecosystem.</p>
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
            <Card key={partner.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
                <Image src={partner.logo} alt={partner.name} width={40} height={40} className="rounded-md" data-ai-hint="logo" />
                <div>
                <CardTitle>{partner.name}</CardTitle>
                <CardDescription>{partner.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <h4 className="font-semibold text-sm">Available Products</h4>
                <div className="space-y-2">
                    {partner.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
                             <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">Up to {formatCurrency(product.maxAmount)} at {product.rate}</p>
                            </div>
                            <Button size="sm" onClick={() => handleApplyClick(product, partner.name)} disabled={!canApply}>Apply</Button>
                        </div>
                    ))}
                    {partner.products.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground pt-4">No products available.</p>
                    )}
                </div>
            </CardContent>
            </Card>
        ))}
        {partners.length === 0 && (
             <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                <p className="text-muted-foreground">No lending partners have registered yet.</p>
                <p className="text-sm text-muted-foreground">Check back soon for loan opportunities.</p>
            </div>
        )}
        </div>
        <Dialog open={!!selectedLoan} onOpenChange={(isOpen) => !isOpen && setSelectedLoan(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply for {selectedLoan?.name}</DialogTitle>
                    <DialogDescription>
                        Select your desired loan amount and confirm your application.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="amount">Loan Amount</Label>
                        <Input 
                            id="amount"
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(Math.max(0, Math.min(selectedLoan?.maxAmount || 0, parseInt(e.target.value) || 0)))}
                            placeholder="e.g. 1000"
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Min: {formatCurrency(500)}</span>
                            <span>Max: {formatCurrency(selectedLoan?.maxAmount || 0)}</span>
                        </div>
                     </div>
                     <Alert>
                        <AlertDescription className="grid grid-cols-3 gap-2 text-center">
                           <div>
                                <p className="text-xs text-muted-foreground">Monthly Payment</p>
                                <p className="font-semibold">{formatCurrency(monthlyPayment)}</p>
                           </div>
                           <div>
                                <p className="text-xs text-muted-foreground">Total Interest</p>
                                <p className="font-semibold">{formatCurrency(totalInterest)}</p>
                           </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Repayment</p>
                                <p className="font-semibold">{formatCurrency(totalRepayment)}</p>
                           </div>
                        </AlertDescription>
                     </Alert>
                    <div className="space-y-1">
                        <Label htmlFor="purpose">Loan Purpose (Optional)</Label>
                        <Input id="purpose" placeholder="e.g., Business expansion, personal project" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedLoan(null)} disabled={isApplying}>Cancel</Button>
                    <Button onClick={handleApplicationSubmit} disabled={isApplying || !user || customAmount <= 0}>
                        {isApplying ? "Submitting..." : !user ? "Please log in" : `Apply for ${formatCurrency(customAmount)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
