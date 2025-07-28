

"use client";

import { useRef, useContext, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload } from 'lucide-react';
import { UserContext } from '@/context/user-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const { user, avatarUrl, setAvatarUrl, deleteAccount } = useContext(UserContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [confirmText, setConfirmText] = useState("");

    const userData = {
        name: user?.displayName || "Anonymous User",
        email: user?.email || "user@example.com",
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if(reader.result) {
                    setAvatarUrl(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-2xl mx-auto">
             <div className="space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account, profile, and notification settings.</p>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>This is how your information is displayed on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarUrl || ''} alt={userData.name} />
                                <AvatarFallback>
                                    <User className="h-10 w-10" />
                                </AvatarFallback>
                            </Avatar>
                            <div className='space-y-2'>
                                 <Button variant="outline" onClick={handleUploadClick}>
                                    <Upload className="mr-2 h-4 w-4"/>
                                    Upload Avatar
                                </Button>
                                <Input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleAvatarChange}
                                 />
                                 <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB.</p>
                            </div>

                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue={userData.email} disabled/>
                        </div>
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

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                            <div>
                                <h4 className="font-semibold text-destructive">Delete My Account</h4>
                                <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is irreversible. All of your application history, connected data sources, and account information will be permanently deleted. To confirm, please type <strong className="text-foreground">DELETE</strong> into the box below.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Input 
                                        id="confirm-delete" 
                                        placeholder="Type DELETE to confirm"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        className="border-destructive focus-visible:ring-destructive"
                                    />
                                    <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={deleteAccount}
                                        disabled={confirmText !== 'DELETE'}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete My Account
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
