
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
    { name: "Albedo", logo: "/wallets/albedo.svg" },
    { name: "Atomic Wallet", logo: "/wallets/generic.svg" },
    { name: "Beans App", logo: "/wallets/generic.svg" },
    { name: "Coinomi", logo: "/wallets/generic.svg" },
    { name: "D'CENT Wallet", logo: "/wallets/generic.svg" },
    { name: "Decaf Wallet", logo: "/wallets/generic.svg" },
    { name: "Ellipal", logo: "/wallets/generic.svg" },
    { name: "Exodus", logo: "/wallets/generic.svg" },
    { name: "Freighter", logo: "/wallets/freighter.svg" },
    { name: "Green Wallet", logo: "/wallets/generic.svg" },
    { name: "Guarda Wallet", logo: "/wallets/generic.svg" },
    { name: "Klever Wallet", logo: "/wallets/generic.svg" },
    { name: "Ledger Nano", logo: "/wallets/generic.svg" },
    { name: "Lobstr Wallet", logo: "/wallets/generic.svg" },
    { name: "Math Wallet", logo: "/wallets/generic.svg" },
    { name: "Mycelium", logo: "/wallets/generic.svg" },
    { name: "Rabet", logo: "/wallets/rabet.svg" },
    { name: "Saza Wallet", logo: "/wallets/generic.svg" },
    { name: "Solar Wallet", logo: "/wallets/generic.svg" },
    { name: "Stellar Account Viewer", logo: "/wallets/generic.svg" },
    { name: "Stellar Laboratory", logo: "/wallets/generic.svg" },
    { name: "StellarTerm", logo: "/wallets/generic.svg" },
    { name: "StormGain Wallet", logo: "/wallets/generic.svg" },
    { name: "Stronghold Wallet", logo: "/wallets/generic.svg" },
    { name: "TokenPocket", logo: "/wallets/generic.svg" },
    { name: "Trezor Wallet", logo: "/wallets/generic.svg" },
    { name: "Trust Wallet", logo: "/wallets/generic.svg" },
    { name: "Vibrant Wallet", logo: "/wallets/generic.svg" },
    { name: "xBull Wallet", logo: "/wallets/xbull.svg" },
    { name: "Custom / None of the Above", logo: "/wallets/generic.svg", isCustom: true },
].sort((a, b) => {
    if (a.isCustom) return 1;
    if (b.isCustom) return -1;
    return a.name.localeCompare(b.name);
});

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const router = useRouter();

  const handleConnect = async (walletName: string) => {
    // In a real app, this would use the Stellar SDK and the specific wallet's API
    // to request the user's public key and sign a message.
    console.log(`Simulating connection with ${walletName}...`);

    let toastDescription = `Please approve the connection in your ${walletName} wallet.`;

    if (walletName.toLowerCase().includes('ledger') || walletName.toLowerCase().includes('trezor')) {
        toastDescription = `Please connect and unlock your ${walletName} device.`;
    } else if (walletName.toLowerCase().includes('custom')) {
        toastDescription = `Please enter your public key to proceed.`;
    }


    toast({
      title: "Connecting...",
      description: toastDescription,
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
