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
  Building,
} from "lucide-react"
import { Button } from "./ui/button"

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="url(#paint0_linear_1_2)" strokeWidth="4"/>
        <path d="M22.5361 12.8787C23.5118 12.3913 24.6477 12.5516 25.4639 13.2529C26.2802 13.9542 26.6343 15.0559 26.353 16.097L22.2929 28.2929C21.8054 29.7686 20.2314 30.5118 18.7557 30.0243C17.28 29.5369 16.5369 27.9629 17.0243 26.4872L21.0845 14.2912C21.2246 13.8821 21.5604 13.5463 21.9695 13.4062L22.5361 12.8787Z" fill="url(#paint1_linear_1_2)"/>
        <path d="M19.9289 10.3431C20.5562 9.71583 21.5025 9.62065 22.2281 10.1112L22.5361 12.8787L21.9695 13.4062C21.4029 13.9337 20.5562 14.1206 19.8305 13.71L15.7704 11.514C15.0447 11.1034 14.7719 10.1571 15.1825 9.43141C15.5931 8.70572 16.5394 8.43292 17.2651 8.84351L19.9289 10.3431Z" fill="url(#paint2_linear_1_2)"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="19.5" y1="12" x2="23" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="15" y1="9" x2="22" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#50D890"/>
                <stop offset="1" stopColor="#47A0F4"/>
            </linearGradient>
        </defs>
    </svg>
)

const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/data-sources', label: 'Data Sources', icon: Database },
    { href: '/dashboard/partners', label: 'Partners', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const partnerMenuItems = [
    { href: '/dashboard/partner-admin', label: 'Loan Dashboard', icon: Building },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]


export function SidebarNav() {
  const pathname = usePathname()
  const isPartnerView = pathname.startsWith('/dashboard/partner-admin');

  const menuItems = isPartnerView ? partnerMenuItems : userMenuItems;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
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
