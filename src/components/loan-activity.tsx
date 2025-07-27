
"use client";

import { useContext } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserContext } from '@/context/user-context';

export function LoanActivity() {
    const { loanActivity } = useContext(UserContext);

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        if (status === 'Active') return 'default';
        if (status === 'Paid Off') return 'secondary';
        if (status === 'Delinquent') return 'destructive';
        return 'outline';
    }

    const getStatusColor = (status: string) => {
        if (status === 'Active') return 'bg-blue-500 hover:bg-blue-600';
        if (status === 'Paid Off') return 'bg-green-500 hover:bg-green-600';
        if (status === 'Delinquent') return 'bg-yellow-500 text-black hover:bg-yellow-600';
        return '';
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Activity</CardTitle>
        <CardDescription>
          Track the status and performance of all disbursed loans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Repaid</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanActivity.length > 0 ? loanActivity.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.user.displayName}</TableCell>
                <TableCell className="text-right">${loan.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">${(loan.repaid || 0).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                    <Badge variant={getStatusVariant(loan.status)} className={getStatusColor(loan.status)}>
                        {loan.status}
                    </Badge>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No loan activity yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
