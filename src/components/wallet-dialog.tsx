
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Wallet } from "lucide-react";

const wallets = [
    { name: "AirTM", logo: "/wallets/generic.svg" },
    { name: "Albedo", logo: "/wallets/albedo.svg" },
    { name: "Beanstalk", logo: "/wallets/generic.svg" },
    { name: "BitGo", logo: "/wallets/generic.svg" },
    { name: "Blockchain.com", logo: "/wallets/generic.svg" },
    { name: "Centaurus", logo: "/wallets/generic.svg" },
    { name: "Cobo Wallet", logo: "/wallets/generic.svg" },
    { name: "Coinbase Wallet", logo: "/wallets/generic.svg" },
    { name: "CoolWallet", logo: "/wallets/generic.svg" },
    { name: "Cosmic-Link", logo: "/wallets/generic.svg" },
    { name: "D'CENT Wallet", logo: "/wallets/generic.svg" },
    { name: "Exodus", logo: "/wallets/generic.svg" },
    { name: "Fireblocks", logo: "/wallets/generic.svg" },
    { name: "Freighter", logo: "/wallets/freighter.svg" },
    { name: "Guarda Wallet", logo: "/wallets/generic.svg" },
    { name: "Ledger", logo: "/wallets/generic.svg" },
    { name: "Lobstr", logo: "/wallets/generic.svg" },
    { name: "Lumi Wallet", logo: "/wallets/generic.svg" },
    { name: "MyEtherWallet", logo: "/wallets/generic.svg" },
    { name: "Nelly", logo: "/wallets/generic.svg" },
    { name: "NiceTrade", logo: "/wallets/generic.svg" },
    { name: "Papaya", logo: "/wallets/generic.svg" },
    { name: "Passphrase.io", logo: "/wallets/generic.svg" },
    { name: "Rabet", logo: "/wallets/rabet.svg" },
    { name: "Saza Wallet", logo: "/wallets/generic.svg" },
    { name: "Scopuly", logo: "/wallets/generic.svg" },
    { name: "SecuX", logo: "/wallets/generic.svg" },
    { name: "Solfis", logo: "/wallets/generic.svg" },
    { name: "Spacewalk", logo: "/wallets/generic.svg" },
    { name: "Stargazer", logo: "/wallets/generic.svg" },
    { name: "StellarTerm", logo: "/wallets/generic.svg" },
    { name: "StellarX", logo: "/wallets/generic.svg" },
    { name: "Tippin.me", logo: "/wallets/generic.svg" },
    { name: "Trezor", logo: "/wallets/generic.svg" },
    { name: "Trust Wallet", logo: "/wallets/generic.svg" },
    { name: "Unstoppable Wallet", logo: "/wallets/generic.svg" },
    { name: "Vibrant", logo: "/wallets/generic.svg" },
    { name: "Wirex", logo: "/wallets/generic.svg" },
    { name: "xBull", logo: "/wallets/xbull.svg" },
    { name: "Zing", logo: "/wallets/generic.svg" },
    { name: "Custom / None of the Above", logo: "/wallets/generic.svg", isCustom: true },
].sort((a, b) => a.name.localeCompare(b.name));

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const router = useRouter();

  const handleConnect = async (walletName: string) => {
    // In a real app, this would use the Stellar SDK and the specific wallet's API
    // to request the user's public key and sign a message.

    // 1. Generate a message to sign
    const message = `Log into Credora at ${new Date().toISOString()}`;
    
    // 2. Request signature from the wallet
    // const signature = await wallet.sign(message);
    
    // 3. Send to backend for verification
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ publicKey, signature, message }),
    // });
    
    // For this demo, we'll simulate a successful connection and redirect.
    console.log(`Simulating connection with ${walletName}...`);

    toast({
      title: "Connecting...",
      description: `Please approve the connection in your ${walletName} wallet.`,
    });

    setTimeout(() => {
        toast({
            title: "Wallet Connected!",
            description: "You have successfully authenticated.",
        });
        onOpenChange(false);
        router.push("/dashboard");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a Stellar Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to sign in or create an account.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
            <div className="grid grid-cols-1 gap-2 py-4">
            {wallets.map((wallet) => (
                <Button
                key={wallet.name}
                variant="outline"
                className="h-14 flex items-center justify-start gap-4 px-4"
                onClick={() => handleConnect(wallet.name)}
                >
                {wallet.isCustom ? <Wallet className="h-6 w-6 text-muted-foreground" /> : <Image src={wallet.logo} alt={wallet.name} width={28} height={28} />}
                <span className="font-semibold">{wallet.name}</span>
                </Button>
            ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
