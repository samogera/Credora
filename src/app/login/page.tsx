import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";

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
            Connect your wallet to access your dashboard.
          </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>User Login</CardTitle>
                <CardDescription>Use your Stellar wallet to log in securely.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button className="w-full font-semibold" size="lg" asChild>
                    <Link href="/dashboard">
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect with Freighter
                    </Link>
                 </Button>
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="secret-key">Secret Key</Label>
                    <Input id="secret-key" type="password" placeholder="S..." required />
                </div>
                 <Button variant="secondary" className="w-full" asChild>
                    <Link href="/dashboard">Login with Key</Link>
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
