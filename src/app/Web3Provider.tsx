"use client";

import { FC, PropsWithChildren } from "react";
import { createConfig, WagmiConfig } from "wagmi";
import { inter } from "@/styles/fonts";
import { mainnet, optimism } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { Toaster } from "react-hot-toast";
import BetaBanner from "@/components/Header/BetaBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const queryClient = new QueryClient();

const metadata = {
  name: "Agora Next",
  description: "The on-chain governance company",
  url: process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

const { namespace } = Tenant.current();

const config = createConfig(
  getDefaultConfig({
    alchemyId: alchemyId,
    walletConnectProjectId: projectId,
    chains: [optimism, mainnet],
    appName: metadata.name,
    appDescription: metadata.description,
    appUrl: metadata.url,
  })
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={config}>
    <QueryClientProvider client={queryClient}>
      <ConnectKitProvider options={{ enforceSupportedChains: false }}>
        <body className={inter.variable}>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          {/* {namespace === TENANT_NAMESPACES.OPTIMISM && <BetaBanner />} */}
          {/* ConnectButtonProvider should be above PageContainer where DialogProvider is since the context is called from this Dialogs  */}
          <ConnectButtonProvider>
            <PageContainer>
              <Toaster />
              <AgoraProvider>{children}</AgoraProvider>
            </PageContainer>
          </ConnectButtonProvider>
          <Footer />
          <SpeedInsights />
        </body>
      </ConnectKitProvider>
    </QueryClientProvider>
  </WagmiConfig>
);

export default Web3Provider;
