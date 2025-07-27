import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconClassName?: string;
    showText?: boolean;
    textSize?: string;
}

export const Logo = ({ className, iconClassName, showText = true, textSize = "text-2xl" }: LogoProps) => (
    <div className={cn("flex items-center gap-2", className)}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-8 h-8", iconClassName)}>
            <defs>
                <linearGradient id="logo-gradient-new" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
            </defs>
            <path fillRule="evenodd" clipRule="evenodd" d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36Z" fill="url(#logo-gradient-new)"/>
            <path d="M14 14H26V18H14V14Z" fill="url(#logo-gradient-new)"/>
            <path d="M14 22H26V26H14V22Z" fill="url(#logo-gradient-new)"/>
        </svg>
        {showText && (
            <span className={cn(
                "font-bold text-foreground",
                textSize
            )}>
                Credora
            </span>
        )}
    </div>
)
