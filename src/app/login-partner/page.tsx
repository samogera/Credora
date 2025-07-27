import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPartnerPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <Logo />
                <span className="text-3xl font-bold text-foreground">Credora</span>
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-muted-foreground">
            Access your partner dashboard to manage loans.
          </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Partner Login</CardTitle>
                <CardDescription>Enter your credentials to access the partner dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="partner@example.com" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
                 <Button className="w-full" asChild>
                    <Link href="/dashboard/partner-admin">Login</Link>
                 </Button>
            </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Not a partner yet?{" "}
          <Link
            href="/signup-partner"
            className="font-medium text-primary hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
