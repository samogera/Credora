"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "January", score: 750 },
  { month: "February", score: 760 },
  { month: "March", score: 755 },
  { month: "April", score: 770 },
  { month: "May", score: 780 },
  { month: "June", score: 785 },
]

const chartConfig = {
  score: {
    label: "Credora Score",
    color: "hsl(var(--primary))",
  },
}

export function CreditScore() {
  const [score, setScore] = useState(785);
  const [isLoading, setIsLoading] = useState(false);

  const getRiskCategory = (currentScore: number) => {
    if (currentScore >= 800) return { text: "Excellent", variant: "default" as const, color: "bg-green-500" };
    if (currentScore >= 740) return { text: "Very Good", variant: "default" as const, color: "bg-emerald-500" };
    if (currentScore >= 670) return { text: "Good", variant: "secondary" as const, color: "bg-sky-500" };
    if (currentScore >= 580) return { text: "Fair", variant: "secondary" as const, color: "bg-yellow-500" };
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
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-xl font-bold">Your Credora Score</CardTitle>
            <CardDescription>A real-time measure of your financial health.</CardDescription>
        </div>
         <Button onClick={handleRecalculate} disabled={isLoading} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Recalculating...' : 'Recalculate'}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center space-y-4 p-6 rounded-lg bg-secondary/50">
            {isLoading ? (
                <>
                    <Skeleton className="h-20 w-36 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-full" />
                </>
            ) : (
                <>
                    <div className="text-7xl font-bold text-primary" style={{fontFamily: 'var(--font-source-code-pro)'}}>{score}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${riskCategory.color} hover:${riskCategory.color}`}>{riskCategory.text} Risk</Badge>
                      <Badge variant="outline">Confidence: 95%</Badge>
                    </div>
                    <Progress value={(score / 850) * 100} className="w-full h-2.5" />
                </>
            )}
        </div>
        <div className="min-h-[250px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                     <YAxis
                        dataKey="score"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        domain={[500, 900]}
                      />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
