import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-vi...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
        destructive:
          "bg-destructive text-white border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
        outline:
          "border border-r-2 border-b-2 bg-background hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
        secondary:
          "bg-white text-secondary-foreground border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
        ghost:
          "border border-r-2 border-b-2 border-transparent hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
        link: "text-primary underline-offset-4 border border-r-2 border-b-2 border-transparent hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };