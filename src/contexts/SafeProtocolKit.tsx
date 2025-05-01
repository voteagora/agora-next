"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount, useChainId } from "wagmi";
import Safe from "@safe-global/protocol-kit";

interface SafeProtocolKitContextType {
  protocolKit: any | null;
  isLoading: boolean;
  error: Error | null;
  initAndConnectProtocolKit: (safeAddress: string) => Promise<any>;
  disconnectSafeWallet: () => Promise<void>;
}

const SafeProtocolKitContext = createContext<SafeProtocolKitContextType>({
  protocolKit: null,
  isLoading: true,
  error: null,
  initAndConnectProtocolKit: async (safeAddress: string) => {},
  disconnectSafeWallet: async () => {},
});

export const useSafeProtocolKit = () => useContext(SafeProtocolKitContext);

export const SafeProtocolKitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const [protocolKit, setProtocolKit] = useState<any | null>(null);
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

        const provider = await connector?.getProvider();
        const safeSDK = await Safe.init({
          provider: provider as any,
          safeAddress,
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

  const disconnectSafeWallet = useCallback(async () => {
    await protocolKit?.disconnect();
    setProtocolKit(null);
    setError(null);
  }, [protocolKit]);

  return (
    <SafeProtocolKitContext.Provider
      value={{
        protocolKit,
        initAndConnectProtocolKit,
        isLoading,
        error,
        disconnectSafeWallet,
      }}
    >
      {children}
    </SafeProtocolKitContext.Provider>
  );
};

export default SafeProtocolKitProvider;
