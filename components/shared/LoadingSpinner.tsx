import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { BubbleLoader } from "./BubbleLoader";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "spinner" | "bubbles";
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
  variant = "spinner",
}: LoadingSpinnerProps) {
  if (variant === "bubbles") {
    return <BubbleLoader size={size} className={className} text={text} />;
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
      />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

