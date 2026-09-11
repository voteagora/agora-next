"use client";

import { PropsWithChildren } from "react";
import { mainnet } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { hashFn } from "@wagmi/core/query";
import { Toaster } from "react-hot-toast";
import { type Chain } from "viem";
import { PageContainer } from "@/components/Layout/PageContainer";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain, toNumericChainId } from "@/lib/utils";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { queryKeyHashFn: hashFn } },
});

export const { contracts: web3Contracts, ui: web3Ui } = Tenant.current();
export const shouldHideAgoraBranding = web3Ui.hideAgoraBranding;
export const tokenChainId = toNumericChainId(web3Contracts.token.chain.id);
export const normalizedTokenChain = {
  ...web3Contracts.token.chain,
  id: tokenChainId,
} as Chain;
export const sharedTransports = {
  [mainnet.id]: getTransportForChain(mainnet.id)!,
  [tokenChainId]: getTransportForChain(tokenChainId)!,
};

export function AgoraAppShell({ children }: PropsWithChildren) {
  return (
    <ConnectButtonProvider>
      <PageContainer>
        <Toaster />
        <AgoraProvider>{children}</AgoraProvider>
      </PageContainer>
    </ConnectButtonProvider>
  );
}
