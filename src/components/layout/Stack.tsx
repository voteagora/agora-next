import React, { ReactNode } from "react";
import * as theme from "@/styles/theme";

type Props = {
  className?: string;
  gap?: keyof (typeof theme)["spacing"];
  justifyContent?:
    | "justify-around"
    | "justify-between"
    | "justify-evenly"
    | "justify-center"
    | "justify-end"
    | "justify-start"
    | "space-around"
    | "space-between"
    | "space-evenly"
    | "stretch"
    | "center"
    | "end"
    | "flex-end"
    | "flex-start"
    | "start";
  alignItems?:
    | "items-stretch"
    | "items-center"
    | "items-start"
    | "items-end"
    | "items-baseline"
    | "center"
    | "end"
    | "flex-end"
    | "flex-start"
    | "start"
    | "self-end"
    | "self-start"
    | "baseline"
    | "normal"
    | "stretch";
  children: ReactNode;
};

function Stack({
  className,
  gap,
  alignItems,
  justifyContent,
  children,
}: Props) {
  const gapClass = gap ? `gap-${gap}` : "";

  return (
    <div
      className={`flex ${justifyContent} ${alignItems} ${gapClass} ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export function VStack(props: Props) {
  return (
    <Stack
      {...props}
      className={`flex-col ${props.className}`} // Add 'flex-col' for vertical stack
    />
  );
}

export function HStack(props: Props) {
  return (
    <Stack
      {...props}
      className={`flex-row ${props.className || ""}`} // Add 'flex-row' for horizontal stack
    />
  );
}
