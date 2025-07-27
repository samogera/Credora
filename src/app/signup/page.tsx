import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";

export default function SignupPage() {
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
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Connect a wallet or create a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full font-semibold" size="lg" asChild>
              <Link href="/dashboard">
                <Wallet className="mr-2 h-5 w-5" />
                Connect with Freighter
              </Link>
            </Button>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
            </div>
            <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard">Create Account</Link>
            </Button>
          </CardContent>
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
