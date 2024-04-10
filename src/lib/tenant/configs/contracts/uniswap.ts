import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider, sepoliaProvider } from "@/app/lib/provider";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

export const uniswapTenantContractConfig = (
  isProd: boolean,
): TenantContracts => {

  const TOKEN = "0xc796953c443f542728eedf33aab32753d3f7a91a";
  const GOVERNOR = "0x0";
  const STAKING = "0x8019fc84c804a9de8f0bcffb5cf90d9982d3f8c5";

  const provider = isProd ? ethProvider : sepoliaProvider;
  const chain = isProd ? mainnet : sepolia;

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: EtherfiToken__factory.connect(TOKEN, provider),
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
