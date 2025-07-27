
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PartnerSettingsPage() {
  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Settings</h1>
            <p className="text-muted-foreground">Manage your public profile, lending preferences, and integrations.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Loan Products</CardTitle>
                        <CardDescription>Define the loan products you want to offer to Credora users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="product-name-1">Product Name</Label>
                                    <Input id="product-name-1" defaultValue="Stablecoin Personal Loan" />
                                </div>
                                 <div className="space-y-1.5">
                                    <Label htmlFor="interest-rate-1">Interest Rate (%)</Label>
                                    <Input id="interest-rate-1" type="number" defaultValue="5.0" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="max-amount-1">Max Amount ($)</Label>
                                    <Input id="max-amount-1" type="number" defaultValue="10000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="duration-1">Term (Months)</Label>
                                    <Input id="duration-1" type="number" defaultValue="12" />
                                </div>
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="requirements-1">Requirements</Label>
                                <Textarea id="requirements-1" placeholder="e.g. Credit score above 700" defaultValue="Credit score above 700" />
                            </div>
                        </div>
                         <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Product
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Lending Preferences</CardTitle>
                        <CardDescription>Set the general criteria for loan applications you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <Label htmlFor="min-score">Minimum Credora Score</Label>
                                <Input id="min-score" type="number" defaultValue="650" />
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="max-risk">Maximum Risk Band</Label>
                                <Input id="max-risk" defaultValue="Medium" />
                            </div>
                        </div>
                        <Button>Save Preferences</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>How your organization appears to users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input id="company-name" defaultValue="Stellar Lend" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="company-website">Website URL</Label>
                            <Input id="company-website" defaultValue="https://stellarlend.finance" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Company Logo</Label>
                            <Button variant="outline" className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                            </Button>
                        </div>
                         <Button className="w-full">Save Profile</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Theme</p>
                                <p className="text-sm text-muted-foreground">Select a light, dark, or system theme.</p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">New Applications</p>
                            <Switch defaultChecked />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">Weekly Summary</p>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
