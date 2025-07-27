
"use client";

import { useState, useContext, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { Logo } from "@/components/logo";
import { UserContext } from "@/context/user-context";
import { toast } from "@/hooks/use-toast";

export default function SignupPartnerPage() {
    const { partnerSignup, isPartner, loading: authLoading } = useContext(UserContext);
    const [companyName, setCompanyName] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && isPartner) {
            router.push('/dashboard/partner-admin');
        }
    }, [isPartner, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName || !website || !email || !password) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all fields to create your partner account.'
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await partnerSignup(email, password, companyName, website);
            toast({
                title: "Registration Successful!",
                description: "Your partner account has been created. You are now being redirected."
            });
            // The useEffect will handle the redirect
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.message || 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = authLoading || isSubmitting;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <div className="w-full max-w-lg p-8 space-y-8">
        <div className="text-center space-y-4">
           <Link href="/">
              <Logo className="justify-center" textSize="text-3xl" />
            </Link>
          <h1 className="text-2xl font-bold tracking-tight">Become a Credora Partner</h1>
          <p className="text-muted-foreground">
            Access a new generation of creditworthy users.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Partner Registration</CardTitle>
                <CardDescription>Fill out the form below to create your partner account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input id="company-name" placeholder="Your Company, Inc." required value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isLoading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="company-website">Company Website</Label>
                        <Input id="company-website" placeholder="https://example.com" required value={website} onChange={e => setWebsite(e.target.value)} disabled={isLoading}/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" placeholder="contact@yourcompany.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading}/>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Partner Account"}
                </Button>
            </CardContent>
          </form>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have a partner account?{" "}
          <Link
            href="/login-partner"
            className="font-medium text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
