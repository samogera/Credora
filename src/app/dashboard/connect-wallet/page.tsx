
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, KeyRound, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const wallets = [
    { name: "Freighter", logo: "https://lh3.googleusercontent.com/_IWkBPJYpuslJcxNCIxeoJqmKJ8WOek43XeEsE_EiDrMzawR31KTAVweF-oyGVKJjW9kbDkxByD6mpYoV7H8uGQA=s60", description: "A popular and user-friendly browser extension wallet for the Stellar network.", link:"/dashboard/data-sources" },
    { name: "Albedo", logo: "https://pbs.twimg.com/profile_images/1488075344484384771/v-3u1Ijg_400x400.jpg", description: "A secure web-based wallet that works on any device without installation.", link:"/dashboard/data-sources" },
];

export default function ConnectWalletPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8 text-center">
                <Wallet className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-4xl font-bold tracking-tight">Connect Your Wallet</h1>
                <p className="text-xl text-muted-foreground">
                    Your Stellar wallet is the key to your on-chain identity and financial history.
                </p>
                <p className="text-sm max-w-2xl mx-auto">
                    Connecting your wallet is a required step to calculate your Credora Score. This process is secure and only reads your public transaction history. You will be asked to sign a SEP-10 message to prove ownership, which is a standard and safe procedure on the Stellar network.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {wallets.map(wallet => (
                    <Card key={wallet.name}>
                        <CardHeader className="flex-row items-center gap-4">
                            <Image src={wallet.logo} alt={wallet.name} width={48} height={48} className="rounded-md" />
                            <div>
                                <CardTitle>{wallet.name}</CardTitle>
                                <CardDescription className="text-xs">{wallet.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <Link href={wallet.link}>Connect {wallet.name}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Use any Wallet</CardTitle>
                    <CardDescription>You can also connect by navigating to the Data Sources page and providing your public Stellar address directly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" asChild>
                        <Link href="/dashboard/data-sources">Go to Data Sources</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
