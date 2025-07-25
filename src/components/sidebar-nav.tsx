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
  ShieldCheck,
  LayoutDashboard,
  Database,
  Users,
  Settings,
  LogOut,
  Building,
} from "lucide-react"
import { Button } from "./ui/button"

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/data-sources', label: 'Data Sources', icon: Database },
    { href: '/dashboard/partners', label: 'Partners', icon: Users },
    { href: '/dashboard/partner-admin', label: 'Partner Admin', icon: Building },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold font-headline">Credora</span>
        </div>
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
         <Button variant="ghost"><LogOut className="mr-2" /> Logout</Button>
      </SidebarFooter>
    </>
  )
}
