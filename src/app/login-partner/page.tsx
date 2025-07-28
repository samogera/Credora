
"use client";

import { useState, useContext, useEffect }from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { Logo } from "@/components/logo";
import { UserContext } from "@/context/user-context";
import { toast } from "@/hooks/use-toast";

export default function LoginPartnerPage() {
    const { partnerLogin, loading } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please enter both email and password.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await partnerLogin(email, password);
            // The context will handle the redirect
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || 'Please check your credentials and try again.'
            });
            setIsSubmitting(false);
        }
    }

  const isLoading = loading || isSubmitting;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-4">
           <Link href="/">
              <Logo className="justify-center" textSize="text-3xl" />
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-muted-foreground">
            Access your partner dashboard to manage loans.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Partner Login</CardTitle>
                <CardDescription>Enter your credentials to access the partner dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="partner@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
                </div>
                 <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                 </Button>
            </CardContent>
          </form>
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
