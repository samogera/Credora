"use client";

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

const loanData = [
    { id: "loan-001", user: "User #4B7A", amount: 10000, interestRate: 5.0, term: 12, status: "Active", repaid: 2500, interestAccrued: 125.50 },
    { id: "loan-002", user: "User #1A5D", amount: 5000, interestRate: 3.5, term: 24, status: "Active", repaid: 1000, interestAccrued: 45.20 },
    { id: "loan-003", user: "User #8C2F", amount: 15000, interestRate: 6.2, term: 36, status: "Paid Off", repaid: 15000, interestAccrued: 1450.80 },
    { id: "loan-004", user: "User #D9E1", amount: 7500, interestRate: 4.2, term: 18, status: "Delinquent", repaid: 1500, interestAccrued: 210.00 },
];

export function LoanActivity() {
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        if (status === 'Active') return 'default';
        if (status === 'Paid Off') return 'secondary';
        if (status === 'Delinquent') return 'destructive';
        return 'outline';
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
              <TableHead className="text-right">Interest Rate</TableHead>
              <TableHead className="text-right">Repaid</TableHead>
              <TableHead className="text-right">Interest Accrued</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanData.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.user}</TableCell>
                <TableCell className="text-right">${loan.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{loan.interestRate.toFixed(2)}%</TableCell>
                <TableCell className="text-right text-green-600">${loan.repaid.toLocaleString()}</TableCell>
                <TableCell className="text-right">${loan.interestAccrued.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                    <Badge variant={getStatusVariant(loan.status)} className={
                        getStatusVariant(loan.status) === 'default' ? 'bg-blue-500' :
                        getStatusVariant(loan.status) === 'secondary' ? 'bg-green-500' :
                        getStatusVariant(loan.status) === 'destructive' ? 'bg-yellow-500' : ''
                    }>
                        {loan.status}
                    </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
