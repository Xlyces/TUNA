import React from "react";

interface TunaLogoProps {
  className?: string;
}

export function TunaLogo({ className }: TunaLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="42"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        TUNA
      </text>
      <text
        x="130"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="56"
        fontWeight="bold"
        fill="#ff6b9d"
      >
        .
      </text>
    </svg>
  );
}

