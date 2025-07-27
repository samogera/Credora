

"use client";

import { useState, useContext } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { UserContext, LoanProduct, Application } from '@/context/user-context';


export default function PartnersPage() {
    const { partners, addApplication, addNotification, user } = useContext(UserContext);
    const [selectedLoan, setSelectedLoan] = useState<LoanProduct & { partnerName: string } | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [customAmount, setCustomAmount] = useState(500);

    const handleApplyClick = (product: LoanProduct, partnerName: string) => {
        setSelectedLoan({ ...product, partnerName });
        setCustomAmount(Math.min(1000, product.maxAmount));
    };

    const handleApplicationSubmit = () => {
        if (!selectedLoan || !user) return;
        setIsApplying(true);

        const newApplication: Omit<Application, 'id' | 'user' | 'userId' | 'userAvatar'> = {
            score: 785, // Dummy score
            loan: {
                id: selectedLoan.id,
                name: selectedLoan.name,
                partnerName: selectedLoan.partnerName,
            },
            amount: customAmount,
            status: 'Pending' as const,
        };

        addApplication(newApplication);

        addNotification({
            for: 'partner',
            userId: 'partner-1', // Hardcoded partner ID for now
            type: 'new_application',
            title: 'New Application',
            message: `${user.displayName || 'A new user'} applied for $${customAmount.toLocaleString()} (${selectedLoan.name}).`,
            read: false,
        })

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

  return (
    <>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Lending Partners</h1>
            <p className="text-muted-foreground">Browse loan products from trusted partners in the Credora ecosystem.</p>
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
            <Card key={partner.name} className="flex flex-col">
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
                            <Button size="sm" onClick={() => handleApplyClick(product, partner.name)}>Apply</Button>
                        </div>
                    ))}
                    {partner.products.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground pt-4">No products available.</p>
                    )}
                </div>
            </CardContent>
            </Card>
        ))}
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
                     <div className="space-y-4">
                        <Label htmlFor="amount">Loan Amount: <span className="font-bold text-primary">{formatCurrency(customAmount)}</span></Label>
                        <Slider
                            id="amount"
                            min={500}
                            max={selectedLoan?.maxAmount || 500}
                            step={100}
                            value={[customAmount]}
                            onValueChange={(value) => setCustomAmount(value[0])}
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>$500</span>
                            <span>{formatCurrency(selectedLoan?.maxAmount || 0)}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label>Interest Rate</Label>
                            <Input defaultValue={selectedLoan?.rate} disabled />
                         </div>
                         <div className="space-y-1">
                            <Label>Max Amount</Label>
                            <Input defaultValue={formatCurrency(selectedLoan?.maxAmount || 0)} disabled />
                         </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="purpose">Loan Purpose (Optional)</Label>
                        <Input id="purpose" placeholder="e.g., Business expansion, personal project" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedLoan(null)} disabled={isApplying}>Cancel</Button>
                    <Button onClick={handleApplicationSubmit} disabled={isApplying || !user}>
                        {isApplying ? "Submitting..." : !user ? "Please log in" : `Apply for ${formatCurrency(customAmount)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
