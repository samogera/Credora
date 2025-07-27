
"use client"

import { useMemo, useContext } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { UserContext } from "@/context/user-context";
import { startOfMonth, format } from "date-fns";

export function AnalyticsCharts() {
  const { loanActivity } = useContext(UserContext);

  const loanStatusData = useMemo(() => {
    const statuses = { Active: 0, "Paid Off": 0, Delinquent: 0 };
    loanActivity.forEach(loan => {
      if (loan.status in statuses) {
        statuses[loan.status as keyof typeof statuses]++;
      }
    });
    return [
      { status: "Active", count: statuses.Active, fill: "var(--color-active)" },
      { status: "Paid Off", count: statuses["Paid Off"], fill: "var(--color-paid)" },
      { status: "Delinquent", count: statuses.Delinquent, fill: "var(--color-delinquent)" },
    ];
  }, [loanActivity]);

  const monthlyVolumeData = useMemo(() => {
    const volumeByMonth: { [key: string]: number } = {};
    loanActivity.forEach(loan => {
      // Assuming loan object has a 'createdAt' timestamp
      if (loan.createdAt) {
        const month = format(startOfMonth(loan.createdAt), "yyyy-MM");
        if (!volumeByMonth[month]) {
          volumeByMonth[month] = 0;
        }
        volumeByMonth[month]++;
      }
    });
    
    // Get last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return format(startOfMonth(d), "yyyy-MM");
    }).reverse();


    return last6Months.map(monthStr => {
      return {
        month: format(new Date(monthStr), "MMMM"),
        loans: volumeByMonth[monthStr] || 0,
      };
    });
  }, [loanActivity]);

  const roi = useMemo(() => {
    const totalPrincipal = loanActivity.reduce((sum, loan) => sum + loan.amount, 0);
    const interestEarned = loanActivity.reduce((sum, loan) => sum + (loan.interestAccrued || 0), 0);
    if (totalPrincipal === 0) return 0;
    return (interestEarned / totalPrincipal) * 100;
  }, [loanActivity]);


  const loanStatusConfig = {
    count: { label: "Loans" },
    active: { label: "Active", color: "hsl(var(--chart-2))" },
    paid: { label: "Paid Off", color: "hsl(var(--chart-3))" },
    delinquent: { label: "Delinquent", color: "hsl(var(--chart-5))" },
  }

  const monthlyVolumeConfig = {
    loans: {
      label: "Loans",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2">
            <CardHeader>
            <CardTitle>Monthly Loan Volume</CardTitle>
            <CardDescription>Last 6 Months</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={monthlyVolumeConfig} className="min-h-64">
                <BarChart accessibilityLayer data={monthlyVolumeData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="loans" fill="var(--color-loans)" radius={8} />
                </BarChart>
            </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
                Showing total loans issued for the last 6 months
            </div>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader className="items-center pb-0">
                <CardTitle>Loan Status Distribution</CardTitle>
                <CardDescription>Current state of all issued loans</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                config={loanStatusConfig}
                className="mx-auto aspect-square max-h-64"
                >
                <PieChart>
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={loanStatusData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                    />
                    <ChartLegend
                        content={<ChartLegendContent nameKey="status" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                    />
                </PieChart>
                </ChartContainer>
            </CardContent>
             <CardFooter className="flex-col gap-2 text-sm">
                 <div className="leading-none text-muted-foreground">
                    Total loans: {loanActivity.length}
                </div>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>ROI Performance</CardTitle>
                <CardDescription>Year-to-date return on investment</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{roi.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Based on interest vs principal</p>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none text-green-500">
                    Calculated in real-time <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Based on interest earned vs. defaults.
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}
