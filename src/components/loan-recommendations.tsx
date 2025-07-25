"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoanRecommendations, GetLoanRecommendationsInput, LoanRecommendation } from "@/ai/flows/get-loan-recommendations";
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info } from 'lucide-react';

const allLoanProducts = [
  { partnerName: "Stellar Lend", productName: "Ecosystem Grant Loan", interestRate: "3.5%", maxAmount: "5000", requirements: "Credit score above 750" },
  { partnerName: "Stellar Lend", productName: "Stablecoin Personal Loan", interestRate: "5.0%", maxAmount: "10000", requirements: "Credit score above 700" },
  { partnerName: "Aqua Finance", productName: "AQUA-Backed Loan", interestRate: "4.2%", maxAmount: "7500", requirements: "Credit score above 680" },
  { partnerName: "Aqua Finance", productName: "Liquidity Provider Loan", interestRate: "6.1%", maxAmount: "25000", requirements: "Credit score above 720 and active liquidity provider" },
  { partnerName: "Anchor Finance", productName: "Small Business Loan", interestRate: "7.5%", maxAmount: "50000", requirements: "Credit score above 650" },
];

export function LoanRecommendations() {
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<LoanRecommendation[] | null>(null);

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        setRecommendations(null);

        const input: GetLoanRecommendationsInput = {
            score: 785, // Using a static score for demonstration
            loanProducts: allLoanProducts
        };

        try {
            const result = await getLoanRecommendations(input);
            setRecommendations(result.recommendations);
        } catch (error) {
            console.error("Error getting loan recommendations:", error);
            // Handle error state in UI
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetRecommendations();
    }, []);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Loan Recommendations</CardTitle>
                        <CardDescription>AI-powered suggestions based on your credit score.</CardDescription>
                    </div>
                     <Button size="sm" onClick={handleGetRecommendations} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}
                {recommendations && (
                    <div className="space-y-4">
                        {recommendations.filter(r => r.isRecommended).map((rec, index) => (
                             <Alert key={index} className="border-primary/50 text-primary-foreground [&>svg]:text-primary">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>
                                    {rec.productName} from {rec.partnerName}
                                </AlertTitle>
                                <AlertDescription>
                                    {rec.reason}
                                    <div className="flex justify-end mt-2">
                                        <Button size="sm" variant="secondary" className="h-7">Learn More</Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                         {recommendations.filter(r => !r.isRecommended).map((rec, index) => (
                             <Alert key={index} variant="default">
                                <Info className="h-4 w-4" />
                                <AlertTitle>
                                    {rec.productName} from {rec.partnerName}
                                </AlertTitle>
                                <AlertDescription>
                                    {rec.reason}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
