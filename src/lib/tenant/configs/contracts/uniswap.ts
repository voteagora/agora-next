import {
  UniswapGovernor__factory,
  UniswapStaker__factory,
  UniswapToken__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider, sepoliaProvider } from "@/app/lib/provider";
import { sepolia, mainnet } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";

export const uniswapTenantContractConfig = (
  isProd: boolean
): TenantContracts => {
  const TOKEN = isProd
    ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    : "0xc796953c443f542728eedf33aab32753d3f7a91a";
  const GOVERNOR = isProd
    ? "0x408ED6354d4973f66138C91495F2f2FCbd8724C3"
    : "0x58b9952016d19bf2c6cb62f398dcde6a22278aaa";
  const STAKER = isProd
    ? "0xe3071e87a7e6dd19a911dbf1127ba9dd67aa6fc8"
    : "0x8019fc84c804a9de8f0bcffb5cf90d9982d3f8c5";

  // Right now there are no sepolia treasury accounts for uniswap.
  // They are set to match.
  const TREASURY = isProd
    ? [
        "0x1a9c8182c09f50c8318d769245bea52c32be35bc",
        "0xe571dC7A558bb6D68FfE264c3d7BB98B0C6C73fC",
      ]
    : [
        "0x1a9c8182c09f50c8318d769245bea52c32be35bc",
        "0xe571dC7A558bb6D68FfE264c3d7BB98B0C6C73fC",
      ];

  const provider = isProd ? ethProvider : sepoliaProvider;
  const chain = isProd ? mainnet : sepolia;

  return {
    token: new TenantContract<ITokenContract>({
      abi: UniswapToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: UniswapToken__factory.connect(TOKEN, provider),
      provider,
    }),

    staker: new TenantContract<IStaker>({
      abi: UniswapStaker__factory.abi,
      address: STAKER,
      chain,
      contract: UniswapStaker__factory.connect(STAKER, provider),
      provider,
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: UniswapGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: UniswapGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
    treasury: TREASURY,
  };
};
