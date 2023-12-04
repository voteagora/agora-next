import React, { ReactNode } from "react";
import * as theme from "@/styles/theme";

// gap-0 gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-8 gap-10 gap-12 gap-16 gap-20 gap-24 gap-32 gap-40 gap-48 gap-56 gap-64 gap-px
// items-stretch items-center items-start items-end items-baseline
// justify-around justify-between justify-evenly justify-center justify-end justify-start

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
  const { className, gap, alignItems, justifyContent, children } = props;

  const classes = [
    "flex",
    "flex-col",
    justifyContent,
    alignItems,
    gap ? `gap-${gap}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export function HStack(props: Props) {
  const { className, gap, alignItems, justifyContent, children } = props;

  const classes = [
    "flex",
    "flex-row",
    justifyContent,
    alignItems,
    gap ? `gap-${gap}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
