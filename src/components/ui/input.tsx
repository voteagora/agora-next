import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const inputVariants = cva(
  "flex h-11 w-full rounded-md border focus:ring-transparent focus:border-input focus:outline-none ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-gray-fa",
        none: "border-none bg-gray-fa",
        bgGray100: "border-input bg-line",
      },
      inputSize: {
        default: "px-3 py-2",
        md: "p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ className, inputSize, variant }))}
        ref={ref}
        {...props}
      />
    );
  }
);
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
