import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ProposalTypesConfigurator__factory,
  AgoraToken__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { optimism } from "viem/chains";

interface Props {
  isProd: boolean;
  alchemyId: string;
}
export const demoTenantConfig = ({ alchemyId }: Props): TenantContracts => {
  const TOKEN = "0xCeF36E1Cff76c957e68e42817b71cdCDa270ACD5";

  const GOVERNOR = "0x18423BD547D402C0CE50B31df9868e5089C33006";

  const TYPES = "0xb6992f1f0659820f3DAF4ebDD16FaFD6ea9EF8eB";

  const TIMELOCK = "0x8b64522450e97c1c3bf00FD54803449b15242BdF";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : new AlchemyProvider("optimism", alchemyId);

  const chain = optimism;

  return {
    token: createTokenContract({
      abi: AgoraToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: AgoraToken__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfigurator__factory.connect(TYPES, provider),
      provider,
    }),

    delegationModel: DELEGATION_MODEL.PARTIAL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
