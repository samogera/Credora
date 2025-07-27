import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Rocket, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login-partner">Partner Login</Link>
          </Button>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© {new Date().getFullYear()} Credora. All Rights Reserved.</span>
            <div className="flex gap-4">
                <Link href="/login-partner" className="font-medium text-primary hover:underline">
                    Partner Login
                </Link>
                 <Link href="/signup-partner" className="font-medium text-primary hover:underline">
                    Become a Partner
                </Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
