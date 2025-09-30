import * as React from "react";
import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 👇 default border style
          "flex h-10 w-full border border-black border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-200 bg-white px-3 py-2 text-sm",
          // 👇 hover and focus styles
          "placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none ",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
