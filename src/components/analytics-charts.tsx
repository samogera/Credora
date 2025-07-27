
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const loanStatusData = [
  { status: "Active", count: 120, fill: "var(--color-active)" },
  { status: "Paid Off", count: 75, fill: "var(--color-paid)" },
  { status: "Delinquent", count: 15, fill: "var(--color-delinquent)" },
];
const loanStatusConfig = {
  count: { label: "Loans" },
  active: { label: "Active", color: "hsl(var(--chart-2))" },
  paid: { label: "Paid Off", color: "hsl(var(--chart-3))" },
  delinquent: { label: "Delinquent", color: "hsl(var(--chart-5))" },
}

const monthlyVolumeData = [
  { month: "January", loans: 186 },
  { month: "February", loans: 305 },
  { month: "March", loans: 237 },
  { month: "April", loans: 273 },
  { month: "May", loans: 209 },
  { month: "June", loans: 214 },
]
const monthlyVolumeConfig = {
  loans: {
    label: "Loans",
    color: "hsl(var(--chart-1))",
  },
}

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2">
            <CardHeader>
            <CardTitle>Monthly Loan Volume</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
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
            <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
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
                    Total active loans: 210
                </div>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>ROI Performance</CardTitle>
                <CardDescription>Year-to-date return on investment</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">14.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last quarter</p>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none text-green-500">
                    Exceeding targets <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Based on interest earned vs. defaults.
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}
