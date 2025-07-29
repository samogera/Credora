import { Logo } from "@/components/logo";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Logo textSize="text-3xl" />
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping -z-10"></div>
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">
                Loading Your Dashboard...
            </p>
        </div>
    </div>
  )
}
