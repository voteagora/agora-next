import React, { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Importing the custom cn function

type Props = {
  className?: string;
  gap?: string; // Tailwind gap classes
  justifyContent?:
    | "justify-around"
    | "justify-between"
    | "justify-evenly"
    | "justify-center"
    | "justify-end"
    | "justify-start";
  alignItems?:
    | "items-stretch"
    | "items-center"
    | "items-start"
    | "items-end"
    | "items-baseline";
  children: ReactNode;
};

function Stack({
  className,
  gap,
  alignItems,
  justifyContent,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "flex", // Static class for flex
        gap, // Dynamic gap class
        justifyContent, // Dynamic justify-content class
        alignItems, // Dynamic align-items class
        className // Additional custom class names
      )}
    >
      {children}
    </div>
  );
}

export function VStack(props: Props) {
  return (
    <Stack
      {...props}
      className={cn("flex-col", props.className)} // Add 'flex-col' for vertical stack
    />
  );
}

export function HStack(props: Props) {
  return (
    <Stack
      {...props}
      className={cn("flex-row", props.className)} // Add 'flex-row' for horizontal stack
    />
  );
}
