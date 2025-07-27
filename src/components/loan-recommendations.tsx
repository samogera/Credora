
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoanRecommendations } from "@/ai/flows/get-loan-recommendations";
import { GetLoanRecommendationsInput, LoanRecommendation } from "@/ai/schemas/loan-recommendations";
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, RefreshCw, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const allLoanProducts = [
  { partnerName: "Stellar Lend", productName: "Ecosystem Grant Loan", interestRate: "3.5%", maxAmount: "5000", requirements: "Credit score above 750" },
  { partnerName: "Stellar Lend", productName: "Stablecoin Personal Loan", interestRate: "5.0%", maxAmount: "10000", requirements: "Credit score above 700" },
  { partnerName: "Aqua Finance", productName: "AQUA-Backed Loan", interestRate: "4.2%", maxAmount: "7500", requirements: "Credit score above 680" },
  { partnerName: "Aqua Finance", productName: "Liquidity Provider Loan", interestRate: "6.1%", maxAmount: "25000", requirements: "Credit score above 720 and active liquidity provider" },
  { partnerName: "Anchor Finance", productName: "Small Business Loan", interestRate: "7.5%", maxAmount: "50000", requirements: "Credit score above 650" },
];

interface LoanRecommendationsProps {
    score: number;
}

export function LoanRecommendations({ score }: LoanRecommendationsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<LoanRecommendation[] | null>(null);

    const handleGetRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const input: GetLoanRecommendationsInput = {
            score: score,
            loanProducts: allLoanProducts
        };

        try {
            const result = await getLoanRecommendations(input);
            setRecommendations(result.recommendations);
        } catch (e) {
            console.error("Error getting loan recommendations:", e);
            setError("We couldn't fetch your AI recommendations at this time. Please try again later.");
            toast({
                variant: 'destructive',
                title: "Recommendation Error",
                description: "Failed to get AI-powered loan recommendations."
            });
        } finally {
            setIsLoading(false);
        }
    }, [score]);

    useEffect(() => {
        handleGetRecommendations();
    }, [handleGetRecommendations]);

    const recommendedLoans = recommendations?.filter(r => r.isRecommended) || [];
    const otherLoans = recommendations?.filter(r => !r.isRecommended) || [];

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>AI Loan Recommendations</CardTitle>
                        <CardDescription>Suggestions for your credit score of <span className="text-accent font-bold">{score}</span>.</CardDescription>
                    </div>
                     <Button size="sm" onClick={handleGetRecommendations} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Refreshing...' : 'Refresh'}
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
                {error && !isLoading && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !error && recommendations && (
                    <div className="space-y-4">
                        {recommendedLoans.length > 0 && recommendedLoans.map((rec, index) => (
                             <Alert key={index} className="border-accent/50 text-foreground [&>svg]:text-accent">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle className="text-accent">
                                    {rec.productName} from {rec.partnerName}
                                </AlertTitle>
                                <AlertDescription>
                                    <p>{rec.reason}</p>
                                    <div className="flex justify-end mt-2">
                                        <Button size="sm" variant="secondary" className="h-7" asChild>
                                           <Link href="/dashboard/partners">Learn More</Link>
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                         {otherLoans.length > 0 && otherLoans.map((rec, index) => (
                             <Alert key={index} variant="default" className="bg-muted/50">
                                <Info className="h-4 w-4" />
                                <AlertTitle>
                                    {rec.productName} from {rec.partnerName}
                                </AlertTitle>
                                <AlertDescription>
                                    {rec.reason}
                                </AlertDescription>
                            </Alert>
                        ))}
                        {recommendations.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No loan products available to recommend.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
