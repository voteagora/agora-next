"use client";

import { FC, PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { createConfig, WagmiProvider, type Transport } from "wagmi";
import { inter } from "@/styles/fonts";
import { mainnet } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { SIWE_ENABLED_PATH_PREFIXES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain, toNumericChainId } from "@/lib/utils";
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
const { contracts, ui } = Tenant.current();
const shouldHideAgoraBranding = ui.hideAgoraBranding;

// Force a numeric id (handles cases like "eip155:11155420")
const tokenChainId = toNumericChainId(contracts.token.chain.id);

const normalizedTokenChain = { ...contracts.token.chain, id: tokenChainId };

export const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: projectId,
    chains: [normalizedTokenChain, mainnet],
    transports: {
      [mainnet.id]: getTransportForChain(mainnet.id)!,
      [tokenChainId]: getTransportForChain(tokenChainId)!,
    },
    appName: metadata.name,
    appDescription: metadata.description,
    appUrl: metadata.url,
  })
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const pathname = usePathname();
  const isSiweScope =
    typeof window !== "undefined" &&
    SIWE_ENABLED_PATH_PREFIXES.some((p) => pathname?.startsWith(p));
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SIWEProvider
          {...siweProviderConfig}
          enabled={Boolean(isSiweScope) && siweProviderConfig.enabled}
        >
          <ConnectKitProvider options={{ enforceSupportedChains: false }}>
            <body className={inter.variable}>
              <noscript>
                You need to enable JavaScript to run this app.
              </noscript>
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
};

export default Web3Provider;
