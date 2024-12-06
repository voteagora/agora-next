import { createWalletClient, custom, http } from "viem";

import {
  createBundlerClient,
  createSmartAccountClientFromExisting,
  getEntryPoint,
  SmartAccountClient,
  WalletClientSigner,
} from "@alchemy/aa-core";

import { createLightAccount, LightAccount } from "@alchemy/aa-accounts";
import { useEffect, useState } from "react";
import Tenant from "@/lib/tenant/tenant";

const TESTNET_ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const TESTNET_FACTORY = "0x000000893A26168158fbeaDD9335Be5bC96592E2";
const LYRA_TESTNET_BUNDLER_URL =
  "https://bundler-prod-testnet-0eakp60405.t.conduit.xyz";

const bundlerRpcMethods = new Set([
  "eth_estimateUserOperationGas",
  "eth_sendUserOperation",
  "eth_getUserOperationByHash",
  "eth_getUserOperationReceipt",
  "eth_supportedEntryPoints",
  process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
    ? "pimlico_getUserOperationGasPrice"
    : null,
]);

const bundlerTransport = http(LYRA_TESTNET_BUNDLER_URL);
const nodeTransport = http(
  `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
);
const { contracts } = Tenant.current();

const combinedTransport = custom({
  async request({ method, params }) {
    if (bundlerRpcMethods.has(method)) {
      return bundlerTransport({ chain: contracts.token.chain }).request({
        method,
        params,
      });
    } else {
      return nodeTransport({ chain: contracts.token.chain }).request({
        method,
        params,
      });
    }
  },
});

export const lyraEntrypoint = getEntryPoint(contracts.token.chain, {
  version: "0.6.0",
  addressOverride: TESTNET_ENTRY_POINT,
});

const lyraBundlerClient = createBundlerClient({
  chain: contracts.token.chain,
  transport: combinedTransport,
  cacheTime: 1000,
});

export const useLyraDeriveAccount = () => {
  const [client, setClient] = useState<SmartAccountClient | undefined>(
    undefined
  );
  const [account, setAccount] = useState<LightAccount | undefined>(undefined);

  const walletClient = createWalletClient({
    chain: contracts.token.chain,
    transport: custom(window.ethereum!),
  });

  const signer = new WalletClientSigner(walletClient, "wallet");

  createLightAccount({
    transport: combinedTransport,
    chain: contracts.token.chain,
    signer,
    entryPoint: lyraEntrypoint,
    factoryAddress: TESTNET_FACTORY,
    version: "v1.1.0",
  }).then((account) => {
    setAccount(account);
  });

  useEffect(() => {
    if (account && !client) {
      setClient(
        createSmartAccountClientFromExisting({
          client: lyraBundlerClient,
          account,
        })
      );
    }
  }, [account, client]);

  return { data: client };
};
