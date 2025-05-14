"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import SafeApiKit from "@safe-global/api-kit";
import { useAccount, useChainId } from "wagmi";

interface SafeApiKitContextType {
  safeApiKit: SafeApiKit | null;
  isLoading: boolean;
  error: Error | null;
}

const SafeApiKitContext = createContext<SafeApiKitContextType>({
  safeApiKit: null,
  isLoading: true,
  error: null,
});

export const useSafeApiKit = () => useContext(SafeApiKitContext);

export const SafeApiKitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [safeApiKit, setSafeApiKit] = useState<SafeApiKit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initSafeApiKit = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Initialize the Safe API Kit
        const apiKit = new SafeApiKit({
          chainId: BigInt(chainId),
        });

        setSafeApiKit(apiKit);
      } catch (err) {
        console.error("Error initializing Safe API Kit:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initSafeApiKit();
  }, [address, isConnected, chainId]);

  return (
    <SafeApiKitContext.Provider value={{ safeApiKit, isLoading, error }}>
      {children}
    </SafeApiKitContext.Provider>
  );
};

export default SafeApiKitProvider;
