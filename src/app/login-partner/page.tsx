import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";

const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="url(#paint0_linear_1_2)" strokeWidth="4"/>
        <path d="M22.5361 12.8787C23.5118 12.3913 24.6477 12.5516 25.4639 13.2529C26.2802 13.9542 26.6343 15.0559 26.353 16.097L22.2929 28.2929C21.8054 29.7686 20.2314 30.5118 18.7557 30.0243C17.28 29.5369 16.5369 27.9629 17.0243 26.4872L21.0845 14.2912C21.2246 13.8821 21.5604 13.5463 21.9695 13.4062L22.5361 12.8787Z" fill="url(#paint1_linear_1_2)"/>
        <path d="M19.9289 10.3431C20.5562 9.71583 21.5025 9.62065 22.2281 10.1112L22.5361 12.8787L21.9695 13.4062C21.4029 13.9337 20.5562 14.1206 19.8305 13.71L15.7704 11.514C15.0447 11.1034 14.7719 10.1571 15.1825 9.43141C15.5931 8.70572 16.5394 8.43292 17.2651 8.84351L19.9289 10.3431Z" fill="url(#paint2_linear_1_2)"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="19.5" y1="12" x2="23" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="15" y1="9" x2="22" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
        </defs>
    </svg>
)

export default function LoginPartnerPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <Logo />
                <span className="text-3xl font-bold text-foreground">Credora</span>
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-muted-foreground">
            Access your partner dashboard to manage loans.
          </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Partner Login</CardTitle>
                <CardDescription>Enter your credentials to access the partner dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="partner@example.com" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
                 <Button className="w-full" asChild>
                    <Link href="/dashboard/partner-admin">Login</Link>
                 </Button>
            </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Not a partner yet?{" "}
          <Link
            href="/signup-partner"
            className="font-medium text-primary hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
