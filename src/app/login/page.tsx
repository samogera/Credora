
"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Loading from "../dashboard/loading";

export default function LoginPage() {
  const { loading, emailLogin } = useContext(UserContext);
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
        await emailLogin(email, password);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-4">
            <Link href="/">
                <Logo className="justify-center" textSize="text-3xl" />
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
                <CardTitle>User Login</CardTitle>
                <CardDescription>Enter your email and password below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
                </div>
                 <Button className="w-full font-semibold" type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                 </Button>
            </CardContent>
          </form>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
