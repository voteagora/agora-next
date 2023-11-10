import { Inter, Rubik } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const rubik = Rubik({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const fontMapper = {
  "font-lora": rubik.variable,
  "font-inter": inter.variable,
} as Record<string, string>;
