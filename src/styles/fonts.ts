import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const rajdhani = localFont({
  src: [
    {
      path: "../../public/fonts/Rajdhani/Rajdhani-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani/Rajdhani-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani/Rajdhani-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani/Rajdhani-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani/Rajdhani-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-rajdhani",
});

export const chivoMono = localFont({
  src: "../../public/fonts/ChivoMono/ChivoMono-Variable.woff2",
  variable: "--font-chivo-mono",
});

export const fontMapper = {
  "font-inter": inter,
  "font-rajdhani": rajdhani,
  "font-chivoMono": chivoMono,
} as Record<string, NextFontWithVariable>;
