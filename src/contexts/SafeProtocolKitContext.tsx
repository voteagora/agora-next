"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useAccount } from "wagmi";
import Safe from "@safe-global/protocol-kit";
import Tenant from "@/lib/tenant/tenant";

interface SafeProtocolKitContextType {
  protocolKit: Safe | null;
  isLoading: boolean;
  error: Error | null;
  initAndConnectProtocolKit: (safeAddress: string) => Promise<void>;
}

const SafeProtocolKitContext = createContext<SafeProtocolKitContextType>({
  protocolKit: null,
  isLoading: true,
  error: null,
  initAndConnectProtocolKit: async (safeAddress: string) => {},
});

export const useSafeProtocolKit = () => useContext(SafeProtocolKitContext);
const { contracts } = Tenant.current();

export const SafeProtocolKitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();

  const [protocolKit, setProtocolKit] = useState<Safe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const initAndConnectProtocolKit = useCallback(
    async (safeAddress: string) => {
      if (!isConnected || !address || !safeAddress || !connector) {
        setIsLoading(false);
      }

      try {
        setIsLoading(true);
        setError(null);
        const provider = await connector?.getProvider({
          chainId: Number(contracts.governor.chain.id),
        });
        const safeSDK = await Safe.init({
          provider: provider as any,
          safeAddress,
          signer: address,
        });
        await safeSDK.connect({
          signer: address,
          safeAddress,
        });
        setProtocolKit(safeSDK);
      } catch (err) {
        console.error("Error initializing Safe Protocol Kit:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, address, connector]
  );

  return (
    <SafeProtocolKitContext.Provider
      value={{
        protocolKit,
        initAndConnectProtocolKit,
        isLoading,
        error,
      }}
    >
      {children}
    </SafeProtocolKitContext.Provider>
  );
};

export default SafeProtocolKitProvider;
