
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

const wallets = [
    { name: "Freighter", logo: "/wallets/freighter.svg", deepLink: "https://www.freighter.app/" },
    { name: "Albedo", logo: "/wallets/albedo.svg", deepLink: "https://albedo.link/" },
    { name: "xBull", logo: "/wallets/xbull.svg", deepLink: "https://xbull.app/" },
    { name: "Rabet", logo: "/wallets/rabet.svg", deepLink: "https://rabet.io/" },
];

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
        <div className="grid grid-cols-2 gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => handleConnect(wallet.name)}
            >
              <Image src={wallet.logo} alt={wallet.name} width={32} height={32} />
              <span className="font-semibold">{wallet.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
