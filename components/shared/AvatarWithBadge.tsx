import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarWithBadgeProps {
  src?: string;
  alt?: string;
  fallback?: string;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function AvatarWithBadge({
  src,
  alt,
  fallback,
  verified = false,
  size = "md",
  className,
}: AvatarWithBadgeProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback || "U"}</AvatarFallback>
      </Avatar>
      {verified && (
        <Badge
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary border-2 border-background"
        >
          <Check className="h-3 w-3 text-primary-foreground" />
        </Badge>
      )}
    </div>
  );
}

