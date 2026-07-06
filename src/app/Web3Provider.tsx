"use client";

import { FC, PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { createConfig, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  safe,
  walletConnect,
} from "wagmi/connectors";
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from "connectkit";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import { ConnectKitModalBridge } from "@/components/providers/ConnectModalContext";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";
import { inter } from "@/styles/fonts";
import {
  AgoraAppShell,
  normalizedTokenChain,
  queryClient,
  sharedTransports,
  shouldHideAgoraBranding,
  web3Ui,
} from "./web3ProviderShared";

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

const PrivyWeb3Provider = dynamic(() => import("./PrivyWeb3Provider"));

const privyToggle = web3Ui.toggle("privy-login");
const privyConfig =
  privyToggle?.enabled && (privyToggle.config as UIPrivyConfig)?.appId
    ? (privyToggle.config as UIPrivyConfig)
    : undefined;

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
          transports: sharedTransports,
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
        transports: sharedTransports,
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
                  <AgoraAppShell>{children}</AgoraAppShell>
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
