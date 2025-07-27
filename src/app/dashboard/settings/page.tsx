import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    // In a real application, this data would come from a user context or API call
    const userData = {
        email: "user@example.com",
        wallet: "GABC...XYZ",
    };

    return (
        <div className="max-w-2xl mx-auto">
             <div className="space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and notification settings.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>This is how your information is displayed on the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={userData.email} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="wallet">Stellar Wallet</Label>
                        <Input id="wallet" defaultValue={userData.wallet} disabled />
                    </div>
                    <Button>Update Profile</Button>
                </CardContent>
            </Card>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choose how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates on loan applications and account activity.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Partner Offers</p>
                            <p className="text-sm text-muted-foreground">Get notified about new loan products from partners.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
