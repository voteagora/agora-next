import {
  ERC20__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const etherfiTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB";
  const GOVERNOR = "0x0";

  const provider = new AlchemyProvider("mainnet", alchemyId);

  const chain = mainnet;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
