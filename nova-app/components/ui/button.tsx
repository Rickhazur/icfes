import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:opacity-90",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:opacity-90",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:shadow-lg hover:opacity-90",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        tool: "bg-card border-2 border-border hover:border-primary hover:shadow-md",
        toolActive: "bg-primary/10 border-2 border-primary shadow-md ring-2 ring-primary/20",
        starter: "bg-accent/10 text-accent border border-accent/30 hover:bg-accent hover:text-accent-foreground",
        send: "bg-primary text-primary-foreground shadow-[0_0_30px_hsl(28_100%_50%/0.3)] hover:shadow-lg",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg",
        magic: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg",
        playful: "bg-white border-2 border-blue-400 text-blue-600 hover:bg-blue-50 shadow-[4px_4px_0px_0px_rgba(96,165,250,1)] hover:translate-y-1 hover:shadow-none transition-all",
        chat: "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 rounded-2xl shadow-sm",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
