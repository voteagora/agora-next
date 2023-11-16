"use client";

import { FC, PropsWithChildren } from "react";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, SIWEConfig, getDefaultConfig } from "connectkit";
import Header from "@/components/Header/Header";
import { inter, rubik } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";

const isNotProduction = process.env.NODE_ENV != "production";

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
      <body className={cn(rubik.variable, inter.variable)}>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <PageContainer>
          {" "}
          <Header />
          {children}
        </PageContainer>
        <Footer />
      </body>
    </ConnectKitProvider>
  </WagmiConfig>
);

export default Web3Provider;
