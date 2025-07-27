
"use client";

import { useState } from "react";
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
import { Wallet, KeyRound } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const wallets = [
    { name: "Lobstr Wallet", logo: "/wallets/lobstr.svg", dataAiHint: "logo" },
    { name: "Ledger Nano", logo: "/wallets/ledger.svg", dataAiHint: "logo hardware" },
    { name: "Trust Wallet", logo: "/wallets/trust.svg", dataAiHint: "logo wallet" },
    { name: "Custom address / other", isCustom: true, dataAiHint: "logo custom" },
];

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const router = useRouter();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [publicKey, setPublicKey] = useState("");

  const handleWalletClick = (walletName: string, isCustom?: boolean) => {
      if (isCustom) {
          setShowCustomInput(true);
      } else {
          handleConnect(walletName);
      }
  }

  const handleConnect = async (walletName: string) => {
    let toastDescription = `Please approve the connection in your ${walletName} wallet.`;
    if (walletName.toLowerCase().includes('ledger') || walletName.toLowerCase().includes('trezor')) {
        toastDescription = `Please connect and unlock your ${walletName} device.`;
    } else if (walletName.toLowerCase().includes('custom')) {
        if (!publicKey.trim().startsWith('G') || publicKey.trim().length !== 56) {
             toast({
                variant: 'destructive',
                title: "Invalid Public Key",
                description: "Please enter a valid Stellar public key (it should start with 'G').",
            });
            return;
        }
        toastDescription = `Connecting with public key: ${publicKey.substring(0, 4)}...${publicKey.substring(52)}`;
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
        // Reset state on close
        setShowCustomInput(false);
        setPublicKey("");
        onOpenChange(false);
        router.push("/dashboard");
    }, 1500);
  };

  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
        setShowCustomInput(false);
        setPublicKey("");
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showCustomInput ? 'Enter Public Key' : 'Connect a Stellar Wallet'}</DialogTitle>
          <DialogDescription>
             {showCustomInput ? 'Please enter your Stellar public address to connect.' : 'Choose your preferred wallet to sign in or create an account.'}
          </DialogDescription>
        </DialogHeader>
        {showCustomInput ? (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="public-key" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" /> Stellar Public Key
                    </Label>
                    <Input 
                        id="public-key" 
                        placeholder="G..." 
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                 <Button className="w-full" onClick={() => handleConnect("Custom")}>Connect with Public Key</Button>
                 <Button variant="outline" className="w-full" onClick={() => setShowCustomInput(false)}>Back to Wallet List</Button>
            </div>
        ) : (
            <ScrollArea className="h-auto max-h-[50vh] pr-4">
                <div className="grid grid-cols-1 gap-2 py-4">
                {wallets.map((wallet) => (
                    <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-14 flex items-center justify-start gap-4 px-4"
                    onClick={() => handleWalletClick(wallet.name, wallet.isCustom)}
                    >
                    {wallet.isCustom ? <Wallet className="h-7 w-7 text-muted-foreground" /> : <Image src={wallet.logo!} alt={wallet.name} width={28} height={28} data-ai-hint={wallet.dataAiHint} />}
                    <span className="font-semibold text-base">{wallet.name}</span>
                    </Button>
                ))}
                </div>
            </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
