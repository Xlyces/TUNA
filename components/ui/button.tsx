import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:scale-105",
        gradient: "bg-gradient-ocean text-white hover:opacity-90 hover:shadow-xl hover:scale-105",
        "gradient-wave": "bg-gradient-wave text-white hover:opacity-90 hover:shadow-xl hover:scale-105",
        "gradient-shimmer": "bg-gradient-shimmer text-white hover:opacity-90 hover:shadow-xl hover:scale-105",
        sky: "bg-[hsl(var(--sky))] text-white hover:bg-[hsl(var(--sky))]/90 hover:shadow-lg hover:scale-105",
        cyan: "bg-[hsl(var(--cyan))] text-white hover:bg-[hsl(var(--cyan))]/90 hover:shadow-lg hover:scale-105",
        teal: "bg-[hsl(var(--teal))] text-white hover:bg-[hsl(var(--teal))]/90 hover:shadow-lg hover:scale-105",
        coral: "bg-[hsl(var(--coral))] text-[hsl(var(--coral-foreground))] hover:bg-[hsl(var(--coral))]/90 hover:shadow-lg hover:scale-105",
        aqua: "bg-[hsl(var(--aqua))] text-[hsl(var(--aqua-foreground))] hover:bg-[hsl(var(--aqua))]/90 hover:shadow-lg hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-105",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const finalClassName = cn(buttonVariants({ variant, size, className }));
    
    // #region agent log - Check button classes and styles
    React.useEffect(() => {
      if (variant === 'coral' || variant === 'aqua') {
        const testBtn = document.querySelector(`.${finalClassName.split(' ')[0]}`);
        if (testBtn) {
          const computed = getComputedStyle(testBtn as HTMLElement);
          const bgColor = computed.backgroundColor;
          fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'button.tsx:useEffect',message:'Button variant styles',data:{variant,className:finalClassName,bgColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
      }
    }, [variant, finalClassName]);
    // #endregion
    
    return (
      <Comp
        className={finalClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

