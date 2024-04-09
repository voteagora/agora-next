import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import provider, { ethProvider } from "@/app/lib/provider";
import { mainnet, optimism } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

export const uniswapTenantContractConfig = (
  isProd: boolean
): TenantContracts => {
  const TOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const GOVERNOR = "0x0";

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(TOKEN, ethProvider),
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain: mainnet,
      contract: OptimismGovernor__factory.connect(GOVERNOR, ethProvider),
    }),
  };
};
