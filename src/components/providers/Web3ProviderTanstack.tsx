"use client";

/*
 * TanStack Start equivalent of src/app/Web3Provider.tsx.
 *
 * Provides the full web3 + app-level context stack:
 *   WagmiProvider → QueryClientProvider → MiradorProvider
 *   → SIWEProvider → ConnectKitProvider
 *   → ConnectButtonProvider → PageContainer (DialogProvider)
 *   → Toaster + AgoraProvider
 *
 * Layout chrome (Header, Footer, DAOMetricsHeader) is kept in
 * __root.tsx so this file stays focussed on context provision.
 *
 * Key differences from Web3Provider.tsx:
 *   - No <body> wrapper (owned by __root.tsx / RootDocument)
 *   - No <SpeedInsights /> (can be added to __root.tsx later)
 *   - `miradorWebApiKey` sourced from env at module load since
 *     TanStack Start has no async Server Component for the root
 */

import { type FC, type PropsWithChildren, useState } from "react";
import { createConfig, WagmiProvider, type Transport } from "wagmi";
import { mainnet } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { hashFn } from "@wagmi/core/query";

import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { PageContainer } from "@/components/Layout/PageContainer";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain, toNumericChainId } from "@/lib/utils";

// ─── Wagmi config ─────────────────────────────────────────────────────────────

const metadata = {
  name: "Agora Next",
  description: "The on-chain governance company",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_AGORA_BASE_URL ?? ""),
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const { contracts, ui } = Tenant.current();

const tokenChainId = toNumericChainId(contracts.token.chain.id);
const normalizedTokenChain = { ...contracts.token.chain, id: tokenChainId };

const transports: Record<number, Transport> = {
  [mainnet.id]: getTransportForChain(mainnet.id)!,
  [tokenChainId]: getTransportForChain(tokenChainId)!,
};

// Create config only on client side to avoid SSR issues with indexedDB
// (mirrors the same pattern in src/app/Web3Provider.tsx).
export const wagmiConfig =
  typeof window !== "undefined"
    ? createConfig({
        ...getDefaultConfig({
          walletConnectProjectId: projectId,
          chains: [normalizedTokenChain, mainnet],
          transports,
          appName: metadata.name,
          appDescription: metadata.description,
          appUrl: metadata.url,
          enableFamily: false,
        }),
        ssr: true,
      })
    : createConfig({
        ssr: true,
        chains: [normalizedTokenChain, mainnet],
        transports,
      });

// ─── Provider component ───────────────────────────────────────────────────────

export const shouldHideAgoraBranding = ui.hideAgoraBranding;

const miradorWebApiKey =
  typeof process !== "undefined"
    ? (process.env.MIRADOR_WEB_API_KEY ?? undefined)
    : undefined;

const Web3ProviderTanstack: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryKeyHashFn: hashFn,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
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
              <ConnectButtonProvider>
                <PageContainer>
                  <Toaster />
                  <AgoraProvider>{children}</AgoraProvider>
                </PageContainer>
              </ConnectButtonProvider>
            </ConnectKitProvider>
          </SIWEProvider>
        </MiradorProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3ProviderTanstack;
