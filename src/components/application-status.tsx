
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature } from 'lucide-react';
import { useState, useContext } from "react";
import { toast } from "@/hooks/use-toast";
import { UserContext } from "@/context/user-context";

export function ApplicationStatus() {
  const { applications, userSignLoan, user } = useContext(UserContext);
  const [signingId, setSigningId] = useState<string | null>(null);

  const handleSign = (appId: string) => {
    setSigningId(appId);
    toast({
        title: "Executing Contract...",
        description: "Please wait while we finalize your loan agreement on the Soroban network.",
    })
    
    userSignLoan(appId).then(() => {
        toast({
            title: "Congratulations!",
            description: "Your loan has been approved and funds are being transferred.",
        })
        setSigningId(null);
    }).catch(error => {
        console.error("Signing error:", error);
        toast({
            variant: "destructive",
            title: "Signing Failed",
            description: "Could not finalize the loan. Please try again.",
        })
        setSigningId(null);
    })
  }

  const getStatusVariant = (status: string) => {
    if (status === 'Approved') return 'default';
    if (status === 'Denied') return 'destructive';
    if (status === 'Signed') return 'default';
    return 'secondary';
  }

  const getStatusColor = (status: string) => {
    if (status === 'Approved' || status === 'Signed') return 'bg-green-500 hover:bg-green-600';
    if (status === 'Denied') return 'bg-red-500 hover:bg-red-600';
    return '';
  }
  
  const userApplications = applications.filter(app => app.userId === user?.uid);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Track the status of your recent loan applications.</CardDescription>
      </CardHeader>
      <CardContent>
        {userApplications.length > 0 ? (
          <ul className="space-y-4">
            {userApplications.map((app) => (
              <li key={app.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{app.loan.name}</p>
                  <p className="text-sm text-muted-foreground">{app.loan.partnerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(app.status)} className={`${getStatusColor(app.status)}`}>
                    {app.status}
                  </Badge>
                  {app.status === 'Approved' && (
                    <Button size="sm" onClick={() => handleSign(app.id)} disabled={signingId === app.id}>
                      <FileSignature className="mr-2 h-4 w-4" />
                      {signingId === app.id ? "Signing..." : "Sign Contract"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-8">You have no active applications.</p>
        )}
      </CardContent>
    </Card>
  );
}
