
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function PartnerSettingsPage() {
  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Settings</h1>
            <p className="text-muted-foreground">Manage your lending preferences, API configurations, and notifications.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Lending Preferences</CardTitle>
                <CardDescription>Set the criteria for loan applications you want to receive.</CardDescription>
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
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="min-amount">Minimum Loan Amount ($)</Label>
                        <Input id="min-amount" type="number" defaultValue="1000" />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="max-amount">Maximum Loan Amount ($)</Label>
                        <Input id="max-amount" type="number" defaultValue="50000" />
                    </div>
                </div>
                <Button>Save Preferences</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>API & Webhooks</CardTitle>
                <CardDescription>Integrate Credora with your own systems programmatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex items-center gap-2">
                        <Input id="api-key" defaultValue="cred_test_************************" readOnly />
                        <Button variant="secondary">Regenerate</Button>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                     <div className="flex items-center gap-2">
                        <Input id="webhook-url" placeholder="https://api.yourcompany.com/webhooks/credora" />
                        <Button variant="secondary">Save</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified about new applications and events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">New Applications</p>
                        <p className="text-sm text-muted-foreground">Receive an email for each new loan application.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Weekly Summary</p>
                        <p className="text-sm text-muted-foreground">Get a weekly report of your portfolio performance.</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
