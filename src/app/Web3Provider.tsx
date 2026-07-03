"use client";

import { FC, PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { createConfig, WagmiProvider, type Transport } from "wagmi";
import { inter } from "@/styles/fonts";
import { mainnet } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  safe,
  walletConnect,
} from "wagmi/connectors";
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
import { getTransportForChain, toNumericChainId } from "@/lib/utils";
import { hashFn } from "@wagmi/core/query";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { ConnectKitModalBridge } from "@/components/providers/ConnectModalContext";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";

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
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const { contracts, ui } = Tenant.current();
const shouldHideAgoraBranding = ui.hideAgoraBranding;

const PrivyWeb3Provider = dynamic(() => import("./PrivyWeb3Provider"));

const privyToggle = ui.toggle("privy-login");
const privyConfig =
  privyToggle?.enabled && (privyToggle.config as UIPrivyConfig)?.appId
    ? (privyToggle.config as UIPrivyConfig)
    : undefined;

// Force a numeric id (handles cases like "eip155:11155420")
const tokenChainId = toNumericChainId(contracts.token.chain.id);

const normalizedTokenChain = { ...contracts.token.chain, id: tokenChainId };

function getConnectors() {
  const isSafeIframe =
    typeof window !== "undefined" && window.parent !== window;
  return [
    ...(isSafeIframe
      ? [
          safe({
            allowedDomains: [/gnosis-safe\.io$/, /app\.safe\.global$/],
          }),
        ]
      : []),
    injected(),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
    ...(projectId
      ? [
          walletConnect({
            showQrModal: false,
            projectId,
            metadata: {
              name: metadata.name,
              description: metadata.description,
              url: metadata.url,
              icons: metadata.icons,
            },
          }),
        ]
      : []),
  ];
}

// Create config only on client side to avoid SSR issues with indexedDB
export const config =
  typeof window !== "undefined"
    ? createConfig({
        ...getDefaultConfig({
          walletConnectProjectId: projectId,
          chains: [normalizedTokenChain, mainnet],
          transports: {
            [mainnet.id]: getTransportForChain(mainnet.id)!,
            [tokenChainId]: getTransportForChain(tokenChainId)!,
          },
          appName: metadata.name,
          appDescription: metadata.description,
          appUrl: metadata.url,
          connectors: getConnectors(),
          enableFamily: false,
        }),
        ssr: true,
      })
    : createConfig({
        ssr: true,
        chains: [normalizedTokenChain, mainnet],
        transports: {
          [mainnet.id]: getTransportForChain(mainnet.id)!,
          [tokenChainId]: getTransportForChain(tokenChainId)!,
        },
      });

const Web3Provider: FC<
  PropsWithChildren<{
    miradorWebApiKey?: string;
  }>
> = ({ children, miradorWebApiKey }) => {
  if (privyConfig) {
    return (
      <PrivyWeb3Provider
        privyConfig={privyConfig}
        miradorWebApiKey={miradorWebApiKey}
      >
        {children}
      </PrivyWeb3Provider>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiradorProvider
          apiKey={miradorWebApiKey}
          enabled={shouldEnableMiradorWebClient()}
        >
          <SIWEProvider
            {...siweProviderConfig}
            enabled={siweProviderConfig.enabled}
          >
            <ConnectKitProvider options={{ enforceSupportedChains: false }}>
              <body className={inter.variable}>
                <noscript>
                  You need to enable JavaScript to run this app.
                </noscript>
                {/* {namespace === TENANT_NAMESPACES.OPTIMISM && <BetaBanner />} */}

                {/* ConnectButtonProvider should be above PageContainer where DialogProvider is since the context is called from this Dialogs  */}
                <ConnectKitModalBridge>
                  <ConnectButtonProvider>
                    <PageContainer>
                      <Toaster />
                      <AgoraProvider>{children}</AgoraProvider>
                    </PageContainer>
                  </ConnectButtonProvider>
                </ConnectKitModalBridge>
                {!shouldHideAgoraBranding && <Footer />}
                <SpeedInsights />
              </body>
            </ConnectKitProvider>
          </SIWEProvider>
        </MiradorProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
