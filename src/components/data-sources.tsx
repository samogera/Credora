

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, FileText, Phone, Upload, Link as LinkIcon, CheckCircle } from "lucide-react";
import { useState, useContext } from "react";
import { UserContext } from "@/context/user-context";
import { WalletDialog } from "./wallet-dialog";

export function DataSources() {
  const { score, connectWalletAndSetScore } = useContext(UserContext);
  const [isWalletConnected, setIsWalletConnected] = useState(!!score);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  const handleConnectWallet = () => {
      // This will be called from the dialog upon successful connection
      connectWalletAndSetScore();
      setIsWalletConnected(true);
      setIsWalletDialogOpen(false);
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
                  <p className="text-sm text-muted-foreground">Gas, Electric, Water</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Phone className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Off-chain ID</p>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <LinkIcon className="mr-2 h-4 w-4" /> Link
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>
      <WalletDialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen} onConnect={handleConnectWallet} />
    </>
  );
}
