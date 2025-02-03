import { NextFont } from "next/dist/compiled/@next/font";
import { Inter } from "next/font/google";
import { Rajdhani } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const fontMapper = {
  "font-inter": inter,
  "font-rajdhani": rajdhani,
} as Record<string, NextFont>;
