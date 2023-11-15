import React, { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Importing the custom cn function
import * as theme from "@/lib/theme";
import { css, cx } from "@emotion/css";

type Props = {
  className?: string;
  gap?: keyof (typeof theme)["spacing"];
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
      className={cx(
        css`
          display: flex;
          gap: ${gap && theme.spacing[gap]};
          justify-content: ${justifyContent};
          align-items: ${alignItems};
        `,
        className
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
