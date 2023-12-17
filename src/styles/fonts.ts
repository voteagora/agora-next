import { Inter } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const fontMapper = {
  "font-inter": inter.variable,
} as Record<string, string>;
