import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider } from "@/app/lib/provider";
import { mainnet } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

export const ensTenantContractConfig = (isProd: boolean): TenantContracts => {
  const TOKEN = isProd
    ? "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"
    : "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67";

  const GOVERNOR = isProd
    ? "0x0"
    : "0x630a6a268191c654ce084aad2d7910ff651e0797";

  const provider = ethProvider;

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(TOKEN, provider),
      provider,
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain: mainnet,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
