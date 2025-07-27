
"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Database,
  Users,
  Settings,
  LogOut,
  BarChart3
} from "lucide-react"
import { Button } from "./ui/button"
import { Logo } from './logo'

const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/data-sources', label: 'Data Sources', icon: Database },
    { href: '/dashboard/partners', label: 'Partners', icon: Users },
]

const partnerMenuItems = [
    { href: '/dashboard/partner-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/partner-admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/partner-admin/settings', label: 'Settings', icon: Settings },
]


export function SidebarNav() {
  const pathname = usePathname()
  const isPartnerView = pathname.startsWith('/dashboard/partner-admin');

  const menuItems = isPartnerView ? partnerMenuItems : userMenuItems;

  return (
    <>
      <SidebarHeader>
        <Logo textSize="text-xl" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton isActive={pathname === item.href}>
                        <item.icon />
                        {item.label}
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/"><LogOut className="mr-2 h-4 w-4" /> Logout</Link>
         </Button>
      </SidebarFooter>
    </>
  )
}
