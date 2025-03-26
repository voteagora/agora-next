"use client";

import { FC, PropsWithChildren } from "react";
import { createConfig, WagmiProvider, type Transport } from "wagmi";
import { inter } from "@/styles/fonts";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import Tenant from "@/lib/tenant/tenant";
import { configItems } from "./config";
import { hashFn } from "@wagmi/core/query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});

const metadata = {
  name: "Agora Next",
  description: "The on-chain governance company",
  url: process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const { ui } = Tenant.current();
const shouldHideAgoraBranding = ui.hideAgoraBranding;

export const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: projectId,
    ...configItems,
    appName: metadata.name,
    appDescription: metadata.description,
    appUrl: metadata.url,
  })
);

const Web3Provider: FC<
  PropsWithChildren<{
    initialWAGMIState: any;
  }>
> = ({ children, initialWAGMIState }) => (
  <WagmiProvider config={config} initialState={initialWAGMIState}>
    <QueryClientProvider client={queryClient}>
      <SIWEProvider {...siweProviderConfig}>
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
            {!shouldHideAgoraBranding && <Footer />}
            <SpeedInsights />
          </body>
        </ConnectKitProvider>
      </SIWEProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default Web3Provider;
