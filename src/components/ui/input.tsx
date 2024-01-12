import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputVariants = cva(
  "flex h-11 w-full rounded-md bg-gray-fa border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        none: "border-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps & VariantProps<typeof inputVariants>
>(({ className, variant, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(inputVariants({ className, variant }))}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const InputDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
});
InputDescription.displayName = "InputDescription";

export { Input, InputDescription };
