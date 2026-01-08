import {
  Chain,
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
  PromiseOrValue,
  SmartAccountClient,
  WalletClientSigner,
} from "@alchemy/aa-core";

import { createLightAccount, LightAccount } from "@alchemy/aa-accounts";
import { useEffect, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { fetchPaymasterData } from "@/app/api/paymaster/fetchPaymasterData";
import {
  DERIVE_MAINNET_RPC,
  DERIVE_TESTNET_RPC,
} from "@/lib/tenant/configs/contracts/derive";
import { toNumericChainId } from "@/lib/utils";
import { isMainContractDeployment } from "@/lib/envConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DUMB_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb1c";

const bundlerRpcMethods = new Set([
  "eth_estimateUserOperationGas",
  "eth_sendUserOperation",
  "eth_getUserOperationByHash",
  "eth_getUserOperationReceipt",
  "eth_supportedEntryPoints",
  isMainContractDeployment() ? "pimlico_getUserOperationGasPrice" : null,
]);

const { contracts, ui } = Tenant.current();

export const lyraEntrypoint = getEntryPoint(contracts.token.chain, {
  version: "0.6.0",
  addressOverride: ui.smartAccountConfig?.entryPointAddress,
});

const combinedTransport = custom({
  async request({ method, params }) {
    const rawChain = contracts.token.chain;
    const numericId = toNumericChainId((rawChain as any).id ?? rawChain);
    const normalizedChain = {
      ...contracts.token.chain,
      id: numericId,
    } satisfies Chain;

    if (bundlerRpcMethods.has(method)) {
      return bundlerTransport({ chain: normalizedChain }).request({
        method,
        params,
      });
    } else {
      return nodeTransport({ chain: normalizedChain }).request({
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

const bundlerTransport = http(ui.smartAccountConfig?.bundlerUrl);
const nodeTransport = http(
  isMainContractDeployment() ? DERIVE_MAINNET_RPC : DERIVE_TESTNET_RPC
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
    ui.smartAccountConfig!.paymasterAddress,
    encodedPaymasterData,
    DUMB_SIGNATURE,
  ]) as `0x${string}`;
};

const paymasterAndData: ClientMiddlewareFn = async (uo) => {
  const params = {
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
  };

  const paymasterAndData = await fetchPaymasterData(params);

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
    factoryAddress: ui.smartAccountConfig!.factoryAddress,
    version: ui.smartAccountConfig!.version,
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
            paymasterAndData,
          },
        })
      );
    }
  }, [account, client]);

  return { data: client };
};
