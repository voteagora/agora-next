"use client";

import { createWalletClient, custom } from "viem";
import { useEffect, useState } from "react";
import { alchemy, AlchemySmartAccountClient } from "@account-kit/infra";
import { WalletClientSigner } from "@aa-sdk/core";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { createLightAccountAlchemyClient } from "@account-kit/smart-contracts";

/**
 * Use this hook whenever working with an Alchemy-supported chain.
 * Alchemy manages all the Smart Account infrastructure, including entry points, bundler, and paymaster contracts.
 */
export const useSmartAccountAlchemy = () => {
  const { ui, contracts } = Tenant.current();
  const scwConfig = ui.smartAccountConfig;
  const chain = contracts.token.chain;

  const [client, setClient] = useState<AlchemySmartAccountClient | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const { isConnected } = useAccount();

  const walletClient = createWalletClient({
    chain: chain,
    transport: custom(window.ethereum!),
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ALCHEMY_SMART_ACCOUNT) {
      console.error(
        "Alchemy Smart Account API Key environment variable is not defined"
      );
      return;
    }

    if (isConnected && scwConfig && !client) {
      setIsLoading(true);
      setIsError(false);
      createLightAccountAlchemyClient({
        transport: alchemy({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_SMART_ACCOUNT,
        }),
        chain: chain,
        version: scwConfig.version,
        factoryAddress: scwConfig.factoryAddress,
        salt: scwConfig.salt,
        signer: new WalletClientSigner(walletClient, "wallet"),
      })
        .then((client) => {
          if (client) {
            setClient(client);
            setIsSuccess(true);
          }
        })
        .catch((error) => {
          console.log("Error creating Alchemy smart account client", error);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isConnected, client, walletClient, scwConfig, chain]);

  return { data: client, isLoading, isSuccess, isError };
};
