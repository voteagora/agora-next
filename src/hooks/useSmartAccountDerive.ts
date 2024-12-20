import {
  concat,
  createWalletClient,
  custom,
  encodeAbiParameters,
  http,
  isHex,
  toHex,
} from "viem";

import {
  BigNumberish,
  ClientMiddlewareFn,
  createBundlerClient,
  createSmartAccountClientFromExisting,
  getEntryPoint,
  SmartAccountClient,
  WalletClientSigner,
  PromiseOrValue,
} from "@alchemy/aa-core";

import { createLightAccount, LightAccount } from "@alchemy/aa-accounts";
import { useEffect, useState } from "react";
import Tenant from "@/lib/tenant/tenant";

const TESTNET_ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const TESTNET_FACTORY = "0x000000893A26168158fbeaDD9335Be5bC96592E2";
const TESTNET_PAYMASTER = "0x5a6499b442711feeA0Aa73C6574042EC5E2e5945";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DUMB_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb1c";

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

const { contracts } = Tenant.current();

export const lyraEntrypoint = getEntryPoint(contracts.token.chain, {
  version: "0.6.0",
  addressOverride: TESTNET_ENTRY_POINT,
});

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

const lyraBundlerClient = createBundlerClient({
  chain: contracts.token.chain,
  transport: combinedTransport,
  cacheTime: 1000,
});

const bundlerTransport = http(LYRA_TESTNET_BUNDLER_URL);
const nodeTransport = http(
  `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
);

const dummyPaymasterAndData = (): `0x${string}` => {
  const validUntil = BigInt(Math.floor(Date.now() / 1000 + 120));
  const validAfter = BigInt(0);
  const erc20 = ZERO_ADDRESS;
  const fee = BigInt(0);
  const encodedPaymasterData = encodeAbiParameters(
    [
      { type: "uint64", name: "validUntil" },
      { type: "uint64", name: "validAfter" },
      { type: "address", name: "erc20" },
      { type: "uint64", name: "fee" },
    ],
    [validUntil, validAfter, erc20, fee]
  );

  return concat([
    TESTNET_PAYMASTER,
    encodedPaymasterData,
    DUMB_SIGNATURE,
  ]) as `0x${string}`;
};

const derivePaymasterAndData: ClientMiddlewareFn = async (uo) => {
  const res = await fetch("https://derive.xyz/api/paymaster", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: PAYMASTER_SECRET,
      userOp: {
        callData: await uo.callData,
        sender: await uo.sender,
        nonce: toHex((await uo.nonce) as bigint),
        initCode: "initCode" in uo ? await uo.initCode : undefined,
        callGasLimit: toHexOrString(uo.callGasLimit),
        verificationGasLimit: toHexOrString(uo.verificationGasLimit),
        preVerificationGas: toHexOrString(uo.preVerificationGas),
        maxFeePerGas: toHexOrString(uo.maxFeePerGas),
        maxPriorityFeePerGas: toHexOrString(uo.maxPriorityFeePerGas),
        paymasterAndData:
          "paymasterAndData" in uo ? await uo.paymasterAndData : undefined,
        signature: await uo.signature,
      },
    }),
    cache: "no-store",
    mode: "no-cors",
  });

  if (!res.ok) {
    throw new Error("failed to fetch paymaster data:" + (await res.text()));
  }

  const { paymasterAndData }: { paymasterAndData: `0x${string}` } =
    await res.json();

  return { ...uo, paymasterAndData };
};

const toHexOrString = (
  input: PromiseOrValue<BigNumberish | undefined> | bigint
) => {
  return isHex(input) ? input : toHex(input as bigint);
};

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
          paymasterAndData: {
            dummyPaymasterAndData,
            paymasterAndData: derivePaymasterAndData,
          },
        })
      );
    }
  }, [account, client]);

  return { data: client };
};
