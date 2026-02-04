import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
        sky:
          "border-transparent bg-[hsl(var(--sky))] text-white hover:bg-[hsl(var(--sky))]/80",
        cyan:
          "border-transparent bg-[hsl(var(--cyan))] text-white hover:bg-[hsl(var(--cyan))]/80",
        teal:
          "border-transparent bg-[hsl(var(--teal))] text-white hover:bg-[hsl(var(--teal))]/80",
        aqua:
          "border-transparent bg-[hsl(var(--aqua))] text-white hover:bg-[hsl(var(--aqua))]/80",
        coral:
          "border-transparent bg-[hsl(var(--coral))] text-[hsl(var(--coral-foreground))] hover:bg-[hsl(var(--coral))]/80",
        web3:
          "border-transparent bg-[hsl(var(--web3))]/10 text-[hsl(var(--web3))] border-[hsl(var(--web3))]/20 hover:bg-[hsl(var(--web3))]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

