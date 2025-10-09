import localFont from "next/font/local";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";


export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/Inter/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter/Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter/Inter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter/Inter-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const rajdhani = localFont({
  src: [
    {
      path: "../../public/fonts/Rajdhani-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Rajdhani-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-rajdhani",
  display: "swap",
});

export const chivoMono = localFont({
  src: [
    {
      path: "../../public/fonts/ChivoMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-chivo-mono",
  display: "swap",
});

export const familjenGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/FamiljenGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-familjen-grotesk",
  display: "swap",
});

export const fontMapper = {
  "font-inter": inter,
  "font-rajdhani": rajdhani,
  "font-chivoMono": chivoMono,
  "font-familjen-grotesk": familjenGrotesk,
} as Record<string, NextFontWithVariable>;
