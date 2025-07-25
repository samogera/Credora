"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditScore() {
  const [score, setScore] = useState(785);
  const [isLoading, setIsLoading] = useState(false);

  const getRiskCategory = (currentScore: number) => {
    if (currentScore > 800) return { text: "Excellent", variant: "default" as const, color: "bg-green-500" };
    if (currentScore > 700) return { text: "Good", variant: "default" as const, color: "bg-emerald-500" };
    if (currentScore > 600) return { text: "Fair", variant: "secondary" as const, color: "bg-yellow-500" };
    return { text: "Poor", variant: "destructive" as const, color: "bg-red-500" };
  };

  const [riskCategory, setRiskCategory] = useState(getRiskCategory(score));

  useEffect(() => {
    setRiskCategory(getRiskCategory(score));
  }, [score]);

  const handleRecalculate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newScore = Math.floor(Math.random() * (850 - 550 + 1)) + 550;
      setScore(newScore);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Your Credora Score</CardTitle>
        <CardDescription>A real-time measure of your on-chain and off-chain financial health.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 h-40">
            <Skeleton className="h-20 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-4 w-full rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-7xl font-headline font-bold text-primary">{score}</div>
            <div className="flex items-center gap-2">
              <Badge variant={riskCategory.variant}>{riskCategory.text} Risk</Badge>
              <Badge variant="outline">Trust Level: High</Badge>
              <Badge variant="outline">Confidence: 95%</Badge>
            </div>
            <Progress value={(score / 850) * 100} className="w-full h-3" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleRecalculate} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Recalculating...' : 'Recalculate Score'}
        </Button>
      </CardFooter>
    </Card>
  );
}
