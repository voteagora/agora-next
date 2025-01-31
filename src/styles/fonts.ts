import { Inter } from "next/font/google";
import { Chivo_Mono } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
  subsets: ["latin"],
});

export const fontMapper = {
  "font-inter": inter.variable,
  "font-chivoMono": chivoMono.variable,
} as Record<string, string>;
