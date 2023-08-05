"use client";

import { FC, PropsWithChildren } from "react";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, SIWEConfig, getDefaultConfig } from "connectkit";
import DevBanner from "@/components/DevBanner";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header/Header";
import { Inter } from "next/font/google";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import Footer from "@/components/Footer";

const isNotProduction = process.env.NODE_ENV != "production";

const inter = Inter({ subsets: ["latin"] });

const config = createConfig(
  getDefaultConfig({
    appName: "Agora Next",
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [mainnet, optimism, polygon, arbitrum],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  })
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={config}>
    <ConnectKitProvider debugMode>
      <body className={inter.className}>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 break-words overflow-hidden">
          {children}
          <Analytics />
        </main>
        <Footer />
      </body>
    </ConnectKitProvider>
  </WagmiConfig>
);

export default Web3Provider;
