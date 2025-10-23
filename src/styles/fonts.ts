import { NextFont, NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Inter } from "next/font/google";
import { Rajdhani } from "next/font/google";
import { Chivo_Mono } from "next/font/google";
import { Familjen_Grotesk } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
  subsets: ["latin"],
});

export const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const fontMapper = {
  "font-inter": inter,
  "font-rajdhani": rajdhani,
  "font-chivoMono": chivoMono,
  "font-familjen-grotesk": familjenGrotesk,
} as Record<string, NextFontWithVariable>;
