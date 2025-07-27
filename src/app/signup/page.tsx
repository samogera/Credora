
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { WalletDialog } from "@/components/wallet-dialog";


export default function SignupPage() {
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  return (
    <>
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
              <CardDescription>Connect a wallet to create your secure, decentralized identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full font-semibold" size="lg" onClick={() => setIsWalletDialogOpen(true)}>
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
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
      <WalletDialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen} />
    </>
  );
}
