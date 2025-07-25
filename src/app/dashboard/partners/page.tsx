"use client";

import { useState } from 'react';
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

const partners = [
  {
    name: "Stellar Lend",
    logo: "https://placehold.co/40x40",
    description: "Low-interest loans for Stellar ecosystem projects.",
    products: [
      { id: "sl-001", name: "Ecosystem Grant Loan", rate: "3.5%", amount: "5,000" },
      { id: "sl-002", name: "Stablecoin Personal Loan", rate: "5.0%", amount: "10,000" },
    ],
  },
  {
    name: "Aqua Finance",
    logo: "https://placehold.co/40x40",
    description: "DeFi lending powered by the AQUA token.",
    products: [
        { id: "af-001", name: "AQUA-Backed Loan", rate: "4.2%", amount: "7,500" },
        { id: "af-002", name: "Liquidity Provider Loan", rate: "6.1%", amount: "25,000" },
    ],
  },
  {
    name: "Anchor Finance",
    logo: "https://placehold.co/40x40",
    description: "Your anchor in the world of decentralized finance.",
     products: [
        { id: "an-001", name: "Small Business Loan", rate: "7.5%", amount: "50,000" },
    ],
  },
];

type LoanProduct = {
  id: string;
  name: string;
  rate: string;
  amount: string;
};

export default function PartnersPage() {
    const [selectedLoan, setSelectedLoan] = useState<LoanProduct | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const handleApplyClick = (product: LoanProduct) => {
        setSelectedLoan(product);
    };

    const handleApplicationSubmit = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            setSelectedLoan(null);
            toast({
                title: "Application Submitted!",
                description: "Your loan application has been sent. You can track its status on your dashboard.",
            });
        }, 1500);
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
                <Image src={partner.logo} alt={partner.name} width={40} height={40} className="rounded-full" data-ai-hint="logo" />
                <div>
                <CardTitle>{partner.name}</CardTitle>
                <CardDescription>{partner.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <h4 className="font-semibold">Available Products</h4>
                <div className="space-y-2">
                    {partner.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
                             <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">Up to ${product.amount} at {product.rate}</p>
                            </div>
                            <Button size="sm" onClick={() => handleApplyClick(product)}>Apply</Button>
                        </div>
                    ))}
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
                        Review the details and confirm your application. Your Credora score will be securely shared.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label>Loan Amount</Label>
                            <Input defaultValue={`$${selectedLoan?.amount}`} disabled />
                         </div>
                         <div className="space-y-1">
                            <Label>Interest Rate</Label>
                            <Input defaultValue={selectedLoan?.rate} disabled />
                         </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="purpose">Loan Purpose</Label>
                        <Input id="purpose" placeholder="e.g., Business expansion, personal project" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedLoan(null)} disabled={isApplying}>Cancel</Button>
                    <Button onClick={handleApplicationSubmit} disabled={isApplying}>
                        {isApplying ? "Submitting..." : "Confirm & Apply"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
