import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-4">
            <Link href="/">
                <Logo className="justify-center" textSize="text-3xl" />
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Connect your wallet or use email to access your dashboard.
          </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>User Login</CardTitle>
                <CardDescription>Use your Stellar wallet for the full decentralized experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button className="w-full font-semibold" size="lg" asChild>
                    <Link href="/dashboard">
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect with Freighter
                    </Link>
                 </Button>
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="user@example.com" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
                 <Button className="w-full" variant="secondary" asChild>
                    <Link href="/dashboard">Login with Email</Link>
                 </Button>
            </CardContent>
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
