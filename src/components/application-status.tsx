
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature } from 'lucide-react';
import { useState, useContext } from "react";
import { toast } from "@/hooks/use-toast";
import { UserContext } from "@/context/user-context";

export function ApplicationStatus() {
  const { applications } = useContext(UserContext);
  const [signingId, setSigningId] = useState<string | null>(null);

  const handleSign = (id: string) => {
    setSigningId(id);
    toast({
        title: "Executing Contract...",
        description: "Please wait while we finalize your loan agreement on the Soroban network.",
    })
    setTimeout(() => {
        // Logic to update the status would go here
        toast({
            title: "Congratulations!",
            description: "Your loan has been approved and funds are being transferred.",
        })
        setSigningId(null);
    }, 2500);
  }

  const getStatusVariant = (status: string) => {
    if (status === 'Approved') return 'default';
    if (status === 'Denied') return 'destructive';
    return 'secondary';
  }

  const getStatusColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-500 hover:bg-green-600';
    if (status === 'Denied') return 'bg-red-500 hover:bg-red-600';
    return '';
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Track the status of your recent loan applications.</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <ul className="space-y-4">
            {applications.map((app) => (
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
