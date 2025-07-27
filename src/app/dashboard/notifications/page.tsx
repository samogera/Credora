

"use client";

import { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Info, User, Check, XCircle, FileSignature } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserContext, Notification } from '@/context/user-context';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const { notifications, markNotificationsAsRead } = useContext(UserContext);
    
    const userNotifications = notifications.filter(n => n.for === 'user');
    const unreadCount = userNotifications.filter(n => !n.read).length;

    const handleMarkAllAsRead = () => {
        markNotificationsAsRead('user');
    }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage and view your recent account activity and alerts.</p>
      </div>
      
      <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Notifications</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
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
                        {userNotifications.map((n, index) => (
                           <NotificationItem key={index} notification={n} isLast={index === userNotifications.length - 1} />
                        ))}
                         {userNotifications.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No notifications yet.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="unread">
                        {userNotifications.filter(n => !n.read).map((n, index) => (
                             <NotificationItem key={index} notification={n} isLast={index === userNotifications.filter(n => !n.read).length - 1} />
                        ))}
                         {userNotifications.filter(n => !n.read).length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No unread notifications.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="read">
                        {userNotifications.filter(n => n.read).map((n, index) => (
                            <NotificationItem key={index} notification={n} isLast={index === userNotifications.filter(n => n.read).length - 1} />
                        ))}
                         {userNotifications.filter(n => n.read).length === 0 && (
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

function NotificationItem({ notification, isLast }: { notification: Notification, isLast: boolean }) {
    
    const getIcon = (type: string) => {
        switch (type) {
            case 'approval': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'denial': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'info': return <Info className="h-5 w-5 text-blue-500" />;
            default: return <User className="h-5 w-5 text-gray-500" />;
        }
    }
    
    return (
      <>
        <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10 border">
                <AvatarFallback>{getIcon(notification.type)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</p>
            </div>
            {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary self-center" title="Unread"></div>}
        </div>
        {!isLast && <Separator />}
      </>
    )
}
