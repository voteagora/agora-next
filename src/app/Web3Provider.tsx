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

// Define the custom icon source
const unicornIconSrc =
  "data:image/png;base64,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";

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
    icon: unicornIconSrc,
    image: {
      src: unicornIconSrc,
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
