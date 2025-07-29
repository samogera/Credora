
"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, KeyRound, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Loading from "../dashboard/loading";

export default function SignupPage() {
  const { user, loading, emailSignup } = useContext(UserContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
        router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill all fields.' });
        return;
    }
    setIsSubmitting(true);
    try {
        await emailSignup(email, password, displayName);
        toast({
            title: "Account Created!",
            description: "You are now being redirected to your dashboard.",
        });
        // The useEffect will handle the redirect
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: error.message || 'Could not create your account. Please try again.'
        });
    } finally {
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
          <h1 className="text-2xl font-bold tracking-tight">Create your Account</h1>
          <p className="text-muted-foreground">
            Get started with decentralized credit scoring.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSignup}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Enter your details to create an account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2"><User className="h-4 w-4" /> Full Name</Label>
                  <Input id="displayName" placeholder="John Doe" required value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</Label>
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
              </div>

              <Button className="w-full font-semibold" type="submit" disabled={isLoading}>
                 {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </CardContent>
          </form>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
