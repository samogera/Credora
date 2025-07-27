import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Rocket, ShieldCheck } from "lucide-react";

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-2xl font-bold text-foreground">Credora</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary/10 to-background">
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Decentralized Credit Scoring, Reimagined
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Credora leverages the power of the Stellar network and AI to create a fair, transparent, and comprehensive credit score for the digital age.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">Connect Wallet & Get Score</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Why Credora?</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Unlock your financial potential with a credit score you truly own.</p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    <Card className="text-center shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                           <CardTitle className="mt-4">Verifiable & Secure</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <CardDescription>Built on the Stellar blockchain, your data is tamper-proof and under your control. Share what you want, when you want.</CardDescription>
                        </CardContent>
                    </Card>
                     <Card className="text-center shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader>
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Zap className="h-6 w-6" />
                            </div>
                           <CardTitle className="mt-4">AI-Powered Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <CardDescription>Our advanced AI analyzes on-chain and off-chain data to provide a holistic view of your financial health, with actionable suggestions.</CardDescription>
                        </CardContent>
                    </Card>
                     <Card className="text-center shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Rocket className="h-6 w-6" />
                            </div>
                           <CardTitle className="mt-4">Unlock Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <CardDescription>Use your Credora score to access better rates from lending partners, dApps, and other financial services in the ecosystem.</CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>
      <footer className="bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} Credora. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
