
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Check, Building, FileSignature } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const allPartnerNotifications = [
    {
      id: 1,
      icon: <User className="h-5 w-5 text-blue-500" />,
      title: "New Application: Anonymous User #4B7A",
      description: "A new loan application for $10,000 (Stablecoin Personal Loan) has been submitted.",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      icon: <User className="h-5 w-5 text-blue-500" />,
      title: "New Application: Anonymous User #9F2C",
      description: "A new loan application for $7,500 (AQUA-Backed Loan) has been submitted.",
      time: "30 minutes ago",
      read: false,
    },
     {
      id: 3,
      icon: <FileSignature className="h-5 w-5 text-green-500" />,
      title: "Contract Signed: Anonymous User #1A5D",
      description: "The loan for $5,000 has been finalized and funds are disbursed.",
      time: "4 hours ago",
      read: true,
    },
    {
      id: 4,
      icon: <Building className="h-5 w-5 text-gray-500" />,
      title: "Profile Updated",
      description: "You successfully updated your public company profile.",
      time: "1 day ago",
      read: true,
    },
  ];

export default function PartnerNotificationsPage() {
    const [notifications, setNotifications] = useState(allPartnerNotifications);
    
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    }

    const toggleRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
    }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage and view your recent partner activity and alerts.</p>
      </div>
      
      <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Notifications</CardTitle>
                <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                   <Check className="mr-2 h-4 w-4" />
                   Mark all as read
                </Button>
              </div>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread <span className='ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-5 w-5'>{unreadCount}</span></TabsTrigger>
                    <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                    <TabsContent value="all">
                        {notifications.map((n, index) => (
                           <NotificationItem key={n.id} notification={n} isLast={index === notifications.length - 1} onToggleRead={toggleRead} />
                        ))}
                    </TabsContent>
                    <TabsContent value="unread">
                        {notifications.filter(n => !n.read).map((n, index) => (
                             <NotificationItem key={n.id} notification={n} isLast={index === notifications.filter(n => !n.read).length - 1} onToggleRead={toggleRead} />
                        ))}
                         {notifications.filter(n => !n.read).length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No unread notifications.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="read">
                        {notifications.filter(n => n.read).map((n, index) => (
                            <NotificationItem key={n.id} notification={n} isLast={index === notifications.filter(n => n.read).length - 1} onToggleRead={toggleRead} />
                        ))}
                         {notifications.filter(n => n.read).length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No read notifications.</p>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
          </CardContent>
      </Card>
    </div>
  )
}

function NotificationItem({ notification, isLast, onToggleRead }: { notification: typeof allPartnerNotifications[0], isLast: boolean, onToggleRead: (id: number) => void}) {
    return (
      <>
        <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10 border">
                <AvatarFallback>{notification.icon}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleRead(notification.id)}>
                {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary" title="Mark as read"></div>}
            </Button>
        </div>
        {!isLast && <Separator />}
      </>
    )
}
