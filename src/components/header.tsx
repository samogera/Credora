

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
import { LifeBuoy, LogOut, Settings, CircleUserRound, Bell, User, Building, CheckCircle, FileSignature, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useContext } from "react";
import { UserContext } from "@/context/user-context";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";

export function Header() {
  const { avatarUrl, notifications, partner, logout } = useContext(UserContext);
  const pathname = usePathname();
  const isPartnerView = pathname.startsWith('/dashboard/partner-admin');

  const settingsPath = isPartnerView ? '/dashboard/partner-admin/settings' : '/dashboard/settings';
  const notificationsPath = isPartnerView ? '/dashboard/partner-admin/notifications' : '/dashboard/notifications';
  
  const relevantNotifications = notifications
    .filter(n => n.for === (isPartnerView ? 'partner' : 'user'))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
  const unreadCount = relevantNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
      switch (type) {
          case 'new_application':
              return <FileSignature className="h-4 w-4 text-blue-500" />;
          case 'approval':
              return <CheckCircle className="h-4 w-4 text-green-500" />;
          case 'denial':
              return <XCircle className="h-4 w-4 text-red-500" />;
          default:
              return <User className="h-4 w-4" />;
      }
  };


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
            {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0" variant="destructive">
                {unreadCount}
                </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-2 border-b">
             <h3 className="text-sm font-medium px-2 py-1">Notifications</h3>
          </div>
          <div className="space-y-1 p-2 max-h-80 overflow-y-auto">
            {relevantNotifications.length > 0 ? relevantNotifications.slice(0, 5).map((notification) => (
              <Link key={notification.id} href={notification.href} passHref>
                <div className="flex items-start gap-3 rounded-md p-2 text-sm hover:bg-accent cursor-pointer">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</p>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
            )}
          </div>
           <div className="p-1 border-t">
              <Button size="sm" variant="link" className="w-full" asChild>
                <Link href={notificationsPath}>View all notifications</Link>
              </Button>
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
                <AvatarImage src={isPartnerView ? partner?.logo : avatarUrl || undefined} alt="User Avatar" data-ai-hint="avatar" />
                <AvatarFallback>
                    {isPartnerView ? <Building /> : <CircleUserRound />}
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
           <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />Logout
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
