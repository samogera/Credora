
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { WalletDialog } from "@/components/wallet-dialog";

export default function LoginPage() {
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center space-y-4">
              <Link href="/">
                  <Logo className="justify-center" textSize="text-3xl" />
              </Link>
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">
              Connect your Stellar wallet to access your dashboard.
            </p>
          </div>
          
          <Card>
              <CardHeader>
                  <CardTitle>User Login</CardTitle>
                  <CardDescription>Use your Stellar wallet for the full decentralized experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                   <Button className="w-full font-semibold" size="lg" onClick={() => setIsWalletDialogOpen(true)}>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
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
      <WalletDialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen} />
    </>
  );
}
