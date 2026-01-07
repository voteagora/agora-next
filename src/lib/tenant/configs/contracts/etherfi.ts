import {
  ERC20__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const etherfiTenantContractConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB";
  const GOVERNOR = TOKEN;

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isMain ? mainnet : sepolia;

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

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
