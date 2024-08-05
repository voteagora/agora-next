import {
  ERC20__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { scroll } from "viem/chains";

import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { JsonRpcProvider } from "ethers";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const scrollTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = "0x5300000000000000000000000000000000000004";
  const GOVERNOR = "0x0";

  const provider = new JsonRpcProvider(
    `https://scroll-mainnet.g.alchemy.com/v2/${alchemyId}`
  );
  const chain = scroll;

  return {
    token: new TenantContract<ITokenContract>({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
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
