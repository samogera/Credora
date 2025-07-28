
"use client";

import { DataSources } from "@/components/data-sources";
import { UserContext } from "@/context/user-context";
import { useContext } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DataSourcesPage() {
    const { score } = useContext(UserContext);
    
    return (
        <div className="max-w-2xl mx-auto">
             <div className="space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                <p className="text-muted-foreground">Connect your data to build your score. You are always in control of what you share.</p>
            </div>
            {!score && (
                 <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Your Score is Not Yet Calculated</AlertTitle>
                    <AlertDescription>
                        Please connect at least one data source, like your Stellar wallet, to generate your initial Credora Score. This will unlock loan recommendations and allow you to apply with our partners.
                    </AlertDescription>
                </Alert>
            )}
             {score && (
                 <Alert variant="default" className="border-primary/50 text-primary [&>svg]:text-primary">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Score Calculated!</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                       <span>You can now view your dashboard and apply for loans.</span>
                       <Button asChild size="sm">
                            <Link href="/dashboard">Go to Dashboard</Link>
                       </Button>
                    </AlertDescription>
                </Alert>
            )}
            <div className="mt-6">
                <DataSources />
            </div>
        </div>
    )
}
