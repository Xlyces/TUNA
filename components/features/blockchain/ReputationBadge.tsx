"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReputationBadgeProps {
  verified?: boolean;
  className?: string;
}

export function ReputationBadge({
  verified = true,
  className,
}: ReputationBadgeProps) {
  if (!verified) return null;

  return (
    <Badge
      variant="web3"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 relative",
        className
      )}
      title="This tutor's credentials are verified and stored on the blockchain, ensuring they can't be faked or changed. It's secure and transparent."
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--web3))] animate-pulse" />
      <span className="text-xs">Verified on blockchain</span>
    </Badge>
  );
}

