import Image from "next/image";
import logo from "./logo.png"; // import the image file relative to Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textSize?: string;
}

export const Logo = ({
  className,
  iconClassName,
  showText = true,
  textSize = "text-2xl",
}: LogoProps) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Image
      src={logo}
      alt="Credora Logo"
      width={40}
      height={40}
      className={cn("w-10 h-10", iconClassName)}
    />
    {showText && (
      <span className={cn("font-code font-bold text-foreground", textSize)}>
        Credora
      </span>
    )}
  </div>
);
