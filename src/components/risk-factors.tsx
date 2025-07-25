
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingUp, Bot } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { explainRiskFactors, ExplainRiskFactorsInput } from '@/ai/flows/explain-risk-factors';

interface RiskFactorsProps {
    score: number;
}

export function RiskFactors({ score }: RiskFactorsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ explanation: string; improvementSuggestions: string } | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    setAiResult(null);
    
    const input: ExplainRiskFactorsInput = {
        score: score,
        stellarActivity: "Frequent transactions, holds various assets.", // Static for demo
        offChainSignals: "Consistent utility payments on time." // Static for demo
    }

    try {
        const result = await explainRiskFactors(input);
        setAiResult(result);
    } catch (error) {
        console.error("Error explaining risk factors:", error);
        // You could show a toast notification here
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Key factors influencing your Credora Score.</CardDescription>
            </div>
            <Button size="sm" onClick={handleExplain} disabled={isLoading}>
                <Bot className={`mr-2 h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
                {isLoading ? "Thinking..." : "Explain with AI"}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        )}
        {aiResult && (
            <div className='space-y-4 mb-4'>
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>AI Explanation</AlertTitle>
                    <AlertDescription>{aiResult.explanation}</AlertDescription>
                </Alert>
                <Alert className="border-primary/50 text-primary-foreground [&>svg]:text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Improvement Suggestions</AlertTitle>
                    <AlertDescription>{aiResult.improvementSuggestions}</AlertDescription>
                </Alert>
            </div>
        )}
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Stellar Activity</AccordionTrigger>
            <AccordionContent>
              <p>Your on-chain behavior on the Stellar network is a primary factor. This includes transaction frequency, volume, asset holdings, and interactions with trusted dApps. Consistent and positive activity builds a strong on-chain reputation.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Off-Chain Signals</AccordionTrigger>
            <AccordionContent>
              <p>Data from verified real-world sources, like utility bill payments, provides a powerful signal of financial responsibility. Timely payments demonstrate reliability and are a key component of your comprehensive credit profile.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Identity Verification</AccordionTrigger>
            <AccordionContent>
              <p>Linking your on-chain identity to verified off-chain identifiers (like a phone number) increases the trust level of your profile. This helps partners know they are interacting with a real, unique individual.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
