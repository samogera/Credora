
"use client";

import { Logo } from "@/components/logo";
import Image from "next/image";
import logo from "@/components/logo.png";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                 <Image
                    src={logo}
                    alt="Credora Logo"
                    width={80}
                    height={80}
                    className="animate-pulse"
                />
            </div>
        </div>
    </div>
  )
}
