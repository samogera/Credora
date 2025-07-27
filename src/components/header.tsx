
"use client"

import Link from "next/link";
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
import { LifeBuoy, LogOut, Settings, CircleUserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useContext } from "react";
import { UserContext } from "@/context/user-context";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { avatarUrl } = useContext(UserContext);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs here */}
      </div>
      <ThemeToggle />
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
            <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
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
