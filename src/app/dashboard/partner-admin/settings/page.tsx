

"use client";

import { useState, useRef, useContext } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Upload, Image as ImageIcon, Trash2, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserContext } from '@/context/user-context';
import { toast } from '@/hooks/use-toast';
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

export default function PartnerSettingsPage() {
    const { partner, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct, deleteAccount } = useContext(UserContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [confirmText, setConfirmText] = useState("");
    
    // Local state for new product form
    const [newProduct, setNewProduct] = useState({ name: '', rate: '', maxAmount: '', term: '', requirements: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [localLogo, setLocalLogo] = useState<string | null>(null);


    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveProfile = () => {
        if (!partner) return;
        const profileToUpdate = {
            name: (document.getElementById('name') as HTMLInputElement).value,
            website: (document.getElementById('website') as HTMLInputElement).value,
            logo: localLogo || partner.logo,
        };
        updatePartnerProfile(profileToUpdate);
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleAddNewProduct = () => {
        if (!newProduct.name || !newProduct.rate || !newProduct.maxAmount) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required product fields.',
            });
            return;
        }
        const productToAdd = {
            name: newProduct.name,
            rate: `${parseFloat(newProduct.rate).toFixed(1)}%`,
            maxAmount: parseInt(newProduct.maxAmount, 10),
            term: parseInt(newProduct.term, 10),
            requirements: newProduct.requirements
        };
        addPartnerProduct(productToAdd);
        setNewProduct({ name: '', rate: '', maxAmount: '', term: '', requirements: '' });
        setIsAdding(false);
        toast({
            title: 'Product Added!',
            description: `${productToAdd.name} is now available to users.`
        });
    };

  if (!partner) {
      return <div>Loading...</div>
  }

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
                    <CardContent className="space-y-4">
                        {partnerProducts.map((product) => (
                           <div key={product.id} className="p-4 border rounded-lg space-y-2 relative">
                                <h4 className="font-semibold">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">Rate: {product.rate} | Max Amount: ${product.maxAmount.toLocaleString()} | Term: {product.term} months</p>
                                {product.requirements && <p className="text-xs text-muted-foreground">Reqs: {product.requirements}</p>}
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removePartnerProduct(product.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                         
                         {isAdding && (
                            <div className="p-4 border rounded-lg space-y-4 border-dashed">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="product-name-new">Product Name</Label>
                                        <Input id="product-name-new" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Stablecoin Loan" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="interest-rate-new">Interest Rate (%)</Label>
                                        <Input id="interest-rate-new" type="number" value={newProduct.rate} onChange={e => setNewProduct({...newProduct, rate: e.target.value})} placeholder="e.g. 5.0" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="max-amount-new">Max Amount ($)</Label>
                                        <Input id="max-amount-new" type="number" value={newProduct.maxAmount} onChange={e => setNewProduct({...newProduct, maxAmount: e.target.value})} placeholder="e.g. 10000" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="duration-new">Term (Months)</Label>
                                        <Input id="duration-new" type="number" value={newProduct.term} onChange={e => setNewProduct({...newProduct, term: e.target.value})} placeholder="e.g. 12" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="requirements-new">Requirements</Label>
                                    <Textarea id="requirements-new" placeholder="e.g. Credit score above 700" value={newProduct.requirements} onChange={e => setNewProduct({...newProduct, requirements: e.target.value})} />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddNewProduct}>Save Product</Button>
                                    <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                </div>
                            </div>
                         )}

                         <Button variant="outline" onClick={() => setIsAdding(true)} disabled={isAdding}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Product
                        </Button>
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
                                <h4 className="font-semibold text-destructive">Delete Partner Account</h4>
                                <p className="text-sm text-muted-foreground">This will permanently delete your account, loan products, and all associated data.</p>
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is irreversible. All of your loan products, active loans, and application history will be permanently deleted. To confirm, please type <strong className="text-foreground">DELETE</strong> into the box below.
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
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>How your organization appears to users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Company Name</Label>
                            <Input id="name" defaultValue={partner.name} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="website">Website URL</Label>
                            <Input id="website" defaultValue={partner.website} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Company Logo</Label>
                             <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-md">
                                    {localLogo || partner.logo ? <Image src={localLogo || partner.logo} alt="Company Logo" layout="fill" objectFit="cover" className="rounded-md" /> :
                                    <AvatarFallback className="rounded-md">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </AvatarFallback>}
                                </Avatar>
                                <Button variant="outline" onClick={handleUploadClick}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                                <Input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleLogoChange}
                                 />
                            </div>
                        </div>
                         <Button className="w-full" onClick={handleSaveProfile}>Save Profile</Button>
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
                            <div>
                               <p className="text-sm font-medium">New Applications</p>
                               <p className="text-xs text-muted-foreground">Get notified of new loan requests.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Weekly Summary</p>
                                <p className="text-xs text-muted-foreground">Receive a report of your activity.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
