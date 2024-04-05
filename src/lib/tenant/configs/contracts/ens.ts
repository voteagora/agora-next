import provider, { ethProvider } from "@/app/lib/provider";
import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";

const TOKEN_ADDRESS = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";
const GOVERNOR_ADDRESS = "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67";

export default function ensContracts(isProd: boolean): TenantContracts {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      contract: EtherfiToken__factory.connect(TOKEN_ADDRESS, ethProvider),
      address: TOKEN_ADDRESS as `0x${string}`,
      chainId: 1,
      chainName: "Ethereum Mainnet",
      abi: EtherfiToken__factory.abi,
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
      contract: OptimismGovernor__factory.connect(GOVERNOR_ADDRESS, provider),
      address: GOVERNOR_ADDRESS,
      chainId: 1,
      chainName: "Ethereum Mainnet",
      abi: OptimismGovernor__factory.abi,
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
    }),
  };
}
