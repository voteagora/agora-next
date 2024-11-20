"use client";

import { FC, PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { inter } from "@/styles/fonts";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, SIWEProvider } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import Tenant from "@/lib/tenant/tenant";
import { config } from "./config";

import { hashFn } from "@wagmi/core/query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});

const { contracts, ui } = Tenant.current();
const shouldHideAgoraBranding = ui.hideAgoraBranding;

const Web3Provider: FC<
  PropsWithChildren<{
    initialWAGMIState: any;
  }>
> = ({ children, initialWAGMIState }) => (
  <WagmiProvider config={config} initialState={initialWAGMIState}>
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
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
