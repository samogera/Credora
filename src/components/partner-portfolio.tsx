
"use client";

import { useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CircleDollarSign, Landmark } from "lucide-react";
import { UserContext } from '@/context/user-context';

export function PartnerPortfolio() {
  const { loanActivity } = useContext(UserContext);

  const stats = useMemo(() => {
    const totalLoanValue = loanActivity.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = loanActivity.filter(loan => loan.status === 'Active');
    const outstandingBalances = activeLoans.reduce((sum, loan) => sum + (loan.amount - (loan.repaid || 0)), 0);
    const interestEarned = loanActivity.reduce((sum, loan) => sum + (loan.interestAccrued || 0), 0);
    const delinquencyRate = loanActivity.length > 0
      ? (loanActivity.filter(loan => loan.status === 'Delinquent').length / loanActivity.length) * 100
      : 0;

    return {
      totalLoanValue,
      outstandingBalances,
      interestEarned,
      delinquencyRate,
      activeLoanCount: activeLoans.length,
    };
  }, [loanActivity]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.totalLoanValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                    From {loanActivity.length} total loans
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.outstandingBalances.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across {stats.activeLoanCount} active loans</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interest Earned (YTD)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">Accrued across all loans</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delinquency Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.delinquencyRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Based on current loan statuses</p>
            </CardContent>
        </Card>
    </div>
  );
}
