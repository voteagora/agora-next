"use client";

import { FC, PropsWithChildren } from "react";
import { WagmiConfig, createConfig } from "wagmi";
import Header from "@/components/Header/Header";
import { inter, rubik } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { mainnet, optimism } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import { Toaster } from "react-hot-toast";

const chains = [optimism, mainnet];
const metadata = {
  name: "Agora Next",
  description: "The on-chain governance company",
  url: process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

// const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata,
// });

const config = createConfig(
  getDefaultConfig({
    alchemyId: alchemyId,
    walletConnectProjectId: projectId,
    chains: chains,
    appName: metadata.name,
    appDescription: metadata.description,
    appUrl: metadata.url,
  })
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={config}>
    <ConnectKitProvider>
      <body className={cn(rubik.variable, inter.variable)}>
        <noscript>You need to enable JavaScript to run this app.</noscript>

        <PageContainer>
          <Toaster />
          <Header />
          <AgoraProvider>{children}</AgoraProvider>
        </PageContainer>
        <Footer />
      </body>
    </ConnectKitProvider>
  </WagmiConfig>
);

export default Web3Provider;
