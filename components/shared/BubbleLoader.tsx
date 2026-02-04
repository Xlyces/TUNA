"use client";

import { cn } from "@/lib/utils";

interface BubbleLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function BubbleLoader({
  size = "md",
  className,
  text,
}: BubbleLoaderProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const containerSize = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", containerSize[size])}>
        {/* Multiple bubbles with different delays */}
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-full bg-[hsl(var(--aqua))] opacity-60",
              sizeClasses[size]
            )}
            style={{
              left: `${25 + index * 20}%`,
              bottom: "10%",
              animation: `bubble ${2 + index * 0.3}s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
        {/* Additional smaller bubbles */}
        {[0, 1].map((index) => (
          <div
            key={`small-${index}`}
            className={cn(
              "absolute rounded-full bg-[hsl(var(--coral))] opacity-40",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
            )}
            style={{
              left: `${30 + index * 30}%`,
              bottom: "15%",
              animation: `bubble ${2.5 + index * 0.4}s ease-in-out infinite`,
              animationDelay: `${0.5 + index * 0.3}s`,
            }}
          />
        ))}
      </div>
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

