import { Analytics } from "@vercel/analytics/react"
import { Inter, Roboto_Mono } from "next/font/google"
import { Provider as BalancerProvider } from "react-wrap-balancer"

import { AppWrapper, WalletProvider } from "./context"

import "../styles/global/styles.css"

import { DevBanner } from "ui"

import { AppLayout, baseMetadata } from "./components"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap"
})

const roboto_mono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap"
})

export const isProduction = process.env.NEXT_PUBLIC_ENV === "prod"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body>
        {!isProduction && <DevBanner />}
        <WalletProvider>
          <AppWrapper>
            <BalancerProvider>
              <AppLayout>{children}</AppLayout>
            </BalancerProvider>
          </AppWrapper>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = baseMetadata
