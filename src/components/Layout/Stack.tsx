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
  return <Stack {...props} className={`flex-col ${props.className}`} />;
}

export function HStack(props: Props) {
  return <Stack {...props} className={`flex-row ${props.className || ""}`} />;
}
