"use client";

import { FC, PropsWithChildren } from "react";
import { mainnet } from "wagmi/chains";
import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { SIWEProvider } from "connectkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter } from "@/styles/fonts";
import Footer from "@/components/Footer";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";
import { PrivyConnectModalBridge } from "./PrivyConnectModalBridge";
import {
  AgoraAppShell,
  normalizedTokenChain,
  queryClient,
  sharedTransports,
  shouldHideAgoraBranding,
} from "./web3ProviderShared";

const wagmiConfig = createConfig({
  chains: [normalizedTokenChain, mainnet],
  transports: sharedTransports,
  ssr: true,
  // don't auto-discover injected wallets (e.g. Rabby) so Privy leads with the
  // email/social flow instead of jumping straight into the extension
  multiInjectedProviderDiscovery: false,
});

const PrivyWeb3Provider: FC<
  PropsWithChildren<{
    privyConfig: UIPrivyConfig;
    miradorWebApiKey?: string;
  }>
> = ({ children, privyConfig, miradorWebApiKey }) => {
  const config: PrivyClientConfig = {
    loginMethods:
      (privyConfig.loginMethods as PrivyClientConfig["loginMethods"]) ?? [
        "email",
        "wallet",
      ],
    appearance: {
      theme: "light",
      accentColor: "#FF0D05",
      showWalletLoginFirst: false,
    },
    embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
    defaultChain: normalizedTokenChain,
    supportedChains: [normalizedTokenChain, mainnet],
  };

  // body must wrap PrivyProvider: Privy injects a hidden auth <iframe>/<img> at
  // the provider root, which is invalid HTML as a direct child of <html>.
  return (
    <body className={inter.variable}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <PrivyProvider appId={privyConfig.appId} config={config}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <MiradorProvider
              apiKey={miradorWebApiKey}
              enabled={shouldEnableMiradorWebClient()}
            >
              <SIWEProvider
                {...siweProviderConfig}
                enabled={siweProviderConfig.enabled}
              >
                <PrivyConnectModalBridge>
                  <AgoraAppShell>{children}</AgoraAppShell>
                  {!shouldHideAgoraBranding && <Footer />}
                  <SpeedInsights />
                </PrivyConnectModalBridge>
              </SIWEProvider>
            </MiradorProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </body>
  );
};

export default PrivyWeb3Provider;
