"use client";

import { FC, PropsWithChildren } from "react";
import { WagmiConfig } from "wagmi";
import Header from "@/components/Header/Header";
import { inter, rubik } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { mainnet, optimism } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/layout/PageContainer";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

const chains = [mainnet, optimism];
const metadata = {
  name: "Agora Next",
  description: "Web3Modal Example",
  url: process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: "light",
});

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={wagmiConfig}>
    <body className={cn(rubik.variable, inter.variable)}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <PageContainer>
        <Header />
        {children}
      </PageContainer>
      <Footer />
    </body>
  </WagmiConfig>
);

export default Web3Provider;
