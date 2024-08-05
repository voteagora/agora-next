import {
  ERC20__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider } from "ethers";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const ensTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"
    : "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67";

  const GOVERNOR = isProd
    ? "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3"
    : "0xb65c031ac61128ae791d42ae43780f012e2f7f89";

  const provider = isProd
    ? new AlchemyProvider("mainnet", alchemyId)
    : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? mainnet : sepolia;

  return {
    token: new TenantContract<ITokenContract>({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: mainnet,
      contract: ERC20__factory.connect(TOKEN, provider),
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
