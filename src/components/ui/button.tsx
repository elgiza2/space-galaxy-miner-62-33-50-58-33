
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white font-medium",
        destructive: "bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white font-medium",
        outline: "border border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-pink-900/20 hover:from-blue-800/30 hover:to-pink-800/30 text-white",
        secondary: "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium",
        ghost: "hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-pink-600/20 text-white",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-pink-400",
        glass: "glass-button text-white font-medium hover:scale-105 active:scale-95",
        "glass-blue": "glass-button glass-button-blue text-white font-medium hover:scale-105 active:scale-95",
        "glass-green": "glass-button glass-button-green text-white font-medium hover:scale-105 active:scale-95",
        "glass-orange": "glass-button glass-button-orange text-white font-medium hover:scale-105 active:scale-95",
        "glass-red": "glass-button glass-button-red text-white font-medium hover:scale-105 active:scale-95",
        "glass-cyan": "glass-button glass-button-cyan text-white font-medium hover:scale-105 active:scale-95",
        "glass-purple": "glass-button glass-button-purple text-white font-medium hover:scale-105 active:scale-95",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
