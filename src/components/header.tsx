
"use client"

import Link from "next/link";
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LifeBuoy, LogOut, Settings, CircleUserRound, Bell, User, Building } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useContext } from "react";
import { UserContext } from "@/context/user-context";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";

const userNotifications = [
    { title: "Loan Approved!", description: "Your application for the Stablecoin Personal Loan has been approved by Stellar Lend." },
    { title: "Application Update", description: "Your application for the AQUA-Backed Loan is still under review." },
];

const partnerNotifications = [
    { title: "New Application", description: "Anonymous User #4B7A has applied for a Stablecoin Personal Loan." },
    { title: "New Application", description: "Anonymous User #9F2C has applied for an AQUA-Backed Loan." },
];

export function Header() {
  const { avatarUrl } = useContext(UserContext);
  const pathname = usePathname();
  const isPartnerView = pathname.startsWith('/dashboard/partner-admin');

  const settingsPath = isPartnerView ? '/dashboard/partner-admin/settings' : '/dashboard/settings';
  const notifications = isPartnerView ? partnerNotifications : userNotifications;
  const notificationIcon = isPartnerView ? <Building className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs here */}
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative rounded-full">
            <Bell />
             <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0" variant="destructive">
              {notifications.length}
            </Badge>
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="p-4">
             <h3 className="text-sm font-medium">Notifications</h3>
          </div>
          <div className="space-y-2 p-2">
            {notifications.map((notification, index) => (
              <div key={index} className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-accent">
                <div className="mt-1">{notificationIcon}</div>
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-muted-foreground">{notification.description}</p>
                </div>
              </div>
            ))}
          </div>
           <div className="p-2 border-t">
              <Button size="sm" variant="link" className="w-full">View all notifications</Button>
           </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
             <Avatar>
                <AvatarImage src={avatarUrl || ''} alt="User Avatar" data-ai-hint="avatar" />
                <AvatarFallback>
                    <CircleUserRound />
                </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={settingsPath}><Settings className="mr-2 h-4 w-4" />Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/support"><LifeBuoy className="mr-2 h-4 w-4" />Support</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
              <Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link>
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
