import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Building } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SignupPartnerPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <div className="w-full max-w-lg p-8 space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">Credora</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Become a Credora Partner</h1>
          <p className="text-muted-foreground">
            Access a new generation of creditworthy users.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Partner Registration</CardTitle>
            <CardDescription>Fill out the form below to apply to our partner program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your Company, Inc." required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="company-website">Company Website</Label>
                    <Input id="company-website" placeholder="https://example.com" required />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" placeholder="contact@yourcompany.com" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="use-case">Tell us about your use case</Label>
                <Textarea id="use-case" placeholder="Describe how your organization would leverage Credora scores..." required />
            </div>
            <Button className="w-full" asChild>
                <Link href="/dashboard">Submit Application</Link>
            </Button>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have a partner account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
