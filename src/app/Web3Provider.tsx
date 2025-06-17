"use client";

import { FC, PropsWithChildren } from "react";
import { createConfig, WagmiProvider, type Transport } from "wagmi";
import { inter } from "@/styles/fonts";
import { mainnet } from "wagmi/chains";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from "connectkit";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { Toaster } from "react-hot-toast";
import {
  createThirdwebClient,
  defineChain as thirdwebDefineChain,
} from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { hashFn } from "@wagmi/core/query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});

const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
  "4e8c81182c3709ee441e30d776223354";
const unicornFactoryAddress =
  process.env.NEXT_PUBLIC_UNICORN_FACTORY_ADDRESS ||
  "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create Thirdweb Client
const client = createThirdwebClient({
  clientId: thirdwebClientId,
});

// Create the Unicorn Wallet Connector (using Thirdweb In-App Wallet)
// Note: The chain specified here is for the smart account functionality as per Unicorn docs.
const unicornConnector = inAppWalletConnector({
  client,
  smartAccount: {
    sponsorGas: true, // or false based on your needs / Unicorn requirements
    chain: thirdwebDefineChain(mainnet.id),
    factoryAddress: unicornFactoryAddress,
  },
  metadata: {
    name: "Unicorn.eth",
    icon: "/images/unicorn.png",
    image: {
      src: "/images/unicorn.png",
      alt: "Unicorn.eth",
      height: 100,
      width: 100,
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
console.log("projectId", projectId);
const { contracts, ui } = Tenant.current();
console.log("Tenant current:", contracts, ui);
const shouldHideAgoraBranding = ui.hideAgoraBranding;

const baseConfig = getDefaultConfig({
  walletConnectProjectId: projectId,
  chains: [contracts.token.chain, mainnet],
  transports: {
    [mainnet.id]: getTransportForChain(mainnet.id)!,
    [contracts.token.chain.id]: getTransportForChain(contracts.token.chain.id)!,
  },
  appName: metadata.name,
  appDescription: metadata.description,
  appUrl: metadata.url,
});
export const config = createConfig({
  ...baseConfig,
  connectors: [unicornConnector, ...(baseConfig.connectors ?? [])],
});

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <SIWEProvider {...siweProviderConfig}>
        <ThirdwebProvider>
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
        </ThirdwebProvider>
      </SIWEProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default Web3Provider;
