

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, FileText, Phone, Upload, Link as LinkIcon, CheckCircle, Smartphone } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/context/user-context";
import { WalletDialog } from "./wallet-dialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

export function DataSources() {
  const { score, connectWalletAndSetScore } = useContext(UserContext);
  const [isWalletConnected, setIsWalletConnected] = useState(!!score);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isUtilityConnected, setIsUtilityConnected] = useState(false);
  const [isIdConnected, setIsIdConnected] = useState(false);
  const [isMobileMoneyConnected, setIsMobileMoneyConnected] = useState(false);

  const [connectingSource, setConnectingSource] = useState<'utility' | 'id' | 'mobile' | null>(null);

  useEffect(() => {
    setIsWalletConnected(!!score);
  }, [score]);

  const handleConnectWallet = () => {
      // This will be called from the dialog upon successful connection
      connectWalletAndSetScore();
      setIsWalletDialogOpen(false);
  }

  const handleConnectSource = (source: 'utility' | 'id' | 'mobile') => {
      let sourceName = 'source';
      if (source === 'utility') sourceName = 'utility bill';
      if (source === 'id') sourceName = 'off-chain ID';
      if (source === 'mobile') sourceName = 'mobile money statement';
      
      setConnectingSource(source);

      toast({
          title: "Connecting Source...",
          description: `Your ${sourceName} is being securely verified. This may take a moment.`,
      });

      setTimeout(() => {
          if (source === 'utility') setIsUtilityConnected(true);
          if (source === 'id') setIsIdConnected(true);
          if (source === 'mobile') setIsMobileMoneyConnected(true);
          setConnectingSource(null);

           toast({
              title: "Source Connected!",
              description: "This data source is now contributing to your Credora Score.",
          });
      }, 2500);
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Connect your data to build your score. You control what you share.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Stellar Wallet</p>
                  <p className="text-sm text-muted-foreground">{isWalletConnected ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
              {isWalletConnected ? 
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Connected</span>
                </div>
                :
                <Button variant="outline" size="sm" onClick={() => setIsWalletDialogOpen(true)}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Connect
                </Button>
              }
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Utility Bills</p>
                  <p className="text-sm text-muted-foreground">{isUtilityConnected ? 'Connected' : 'Gas, Electric, Water'}</p>
                </div>
              </div>
              {connectingSource === 'utility' ? <Skeleton className="h-8 w-24 rounded-md" /> : isUtilityConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Connected</span>
                </div>
               ) : (
                <Button variant="outline" size="sm" onClick={() => handleConnectSource('utility')} disabled={!!connectingSource}>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
               )}
            </li>
             <li className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Smartphone className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Mobile Money</p>
                  <p className="text-sm text-muted-foreground">{isMobileMoneyConnected ? 'Connected' : 'M-Pesa, Airtel'}</p>
                </div>
              </div>
              {connectingSource === 'mobile' ? <Skeleton className="h-8 w-24 rounded-md" /> : isMobileMoneyConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Connected</span>
                </div>
               ) : (
                <Button variant="outline" size="sm" onClick={() => handleConnectSource('mobile')} disabled={!!connectingSource}>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
               )}
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Phone className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Off-chain ID</p>
                  <p className="text-sm text-muted-foreground">{isIdConnected ? 'Connected' : 'Phone Number'}</p>
                </div>
              </div>
              {connectingSource === 'id' ? <Skeleton className="h-8 w-20 rounded-md" /> : isIdConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Connected</span>
                </div>
               ) : (
                <Button variant="outline" size="sm" onClick={() => handleConnectSource('id')} disabled={!!connectingSource}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Link
                </Button>
              )}
            </li>
          </ul>
        </CardContent>
      </Card>
      <WalletDialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen} onConnect={handleConnectWallet} />
    </>
  );
}
