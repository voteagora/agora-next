import {
  OptimismGovernor__factory,
  UniswapStaker__factory,
  UniswapToken__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider, sepoliaProvider } from "@/app/lib/provider";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";

export const uniswapTenantContractConfig = (
  isProd: boolean
): TenantContracts => {
  const TOKEN = "0xc796953c443f542728eedf33aab32753d3f7a91a";
  const GOVERNOR = "0x0";
  const STAKING = "0x8019fc84c804a9de8f0bcffb5cf90d9982d3f8c5";

  const provider = isProd ? ethProvider : sepoliaProvider;
  const chain = isProd ? mainnet : sepolia;

  return {
    token: new TenantContract<ITokenContract>({
      abi: UniswapToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: UniswapToken__factory.connect(TOKEN, provider),
    }),

    staker: new TenantContract<IStaker>({
      abi: UniswapStaker__factory.connect(STAKING, provider),
      address: STAKING,
      chain,
      contract: UniswapStaker__factory.connect(STAKING, provider),
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
    }),
  };
};
