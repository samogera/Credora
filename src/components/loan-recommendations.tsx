
"use client";

import { useState, useEffect, useCallback, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoanRecommendations } from "@/ai/flows/get-loan-recommendations";
import { GetLoanRecommendationsInput, GetLoanRecommendationsOutput } from "@/ai/schemas/loan-recommendations";
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, RefreshCw, XCircle, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserContext } from '@/context/user-context';

interface LoanRecommendationsProps {
    score: number;
}

export function LoanRecommendations({ score }: LoanRecommendationsProps) {
    const { partners, loading: userContextLoading } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GetLoanRecommendationsOutput | null>(null);

    const handleGetRecommendations = useCallback(async () => {
        if (userContextLoading) return;
        setIsLoading(true);
        setError(null);

        const allLoanProducts = partners.flatMap(p => 
            p.products.map(prod => ({
                partnerName: p.name,
                productName: prod.name,
                interestRate: prod.rate,
                maxAmount: prod.maxAmount.toString(),
                requirements: prod.requirements || `Score > 650`, // Default requirement
            }))
        );

        const input: GetLoanRecommendationsInput = {
            score: score,
            loanProducts: allLoanProducts
        };

        try {
            const aiResult = await getLoanRecommendations(input);
            setResult(aiResult);
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
    }, [score, partners, userContextLoading]);

    useEffect(() => {
        handleGetRecommendations();
    }, [handleGetRecommendations, score, partners]);

    const recommendedLoans = result?.recommendations?.filter(r => r.isRecommended) || [];
    const otherLoans = result?.recommendations?.filter(r => !r.isRecommended) || [];
    const showLoading = isLoading || userContextLoading;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>AI Loan Recommendations</CardTitle>
                        <CardDescription>Suggestions for your credit score of <span className="text-accent font-bold">{score}</span>.</CardDescription>
                    </div>
                     <Button size="sm" onClick={handleGetRecommendations} disabled={showLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${showLoading ? 'animate-spin' : ''}`} />
                        {showLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {showLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}
                {error && !showLoading && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!showLoading && !error && result && (
                    <div className="space-y-4">
                        {partners.length === 0 && (
                             <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>No Partners Available</AlertTitle>
                                <AlertDescription>
                                    There are currently no lending partners in the ecosystem. Please check back later for loan opportunities.
                                </AlertDescription>
                            </Alert>
                        )}
                        {partners.length > 0 && recommendedLoans.length === 0 && result.improvementSuggestion && (
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Actionable Advice</AlertTitle>
                                <AlertDescription>
                                    {result.improvementSuggestion}
                                </AlertDescription>
                            </Alert>
                        )}
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    