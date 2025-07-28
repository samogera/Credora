
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

export default function LoginPage() {
  const { loading, emailLogin, googleLogin } = useContext(UserContext);
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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
        await googleLogin();
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'Could not sign in with Google.'
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
                 
                 <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-[-10px] bg-card px-2 text-xs text-muted-foreground">OR</span>
                 </div>

                <Button variant="outline" className="w-full font-semibold" onClick={handleGoogleLogin} disabled={isLoading} type="button">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-63.5 63.5C330.7 99.8 291.9 80 248 80c-82.8 0-150.5 67.7-150.5 150.5S165.2 431.5 248 431.5c97.2 0 130.3-72.9 135.2-109.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Sign in with Google
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
