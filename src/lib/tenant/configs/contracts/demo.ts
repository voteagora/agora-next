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
  isMain: boolean;
  alchemyId: string;
}
export const demoTenantConfig = ({ alchemyId }: Props): TenantContracts => {
  const TOKEN = "0xd5741323b3ddfe5556C3477961B5160600C29c53";

  const GOVERNOR = "0x95a35Cd8638b732E839C6CCDD0d8B7FA06319677";

  const TYPES = "0x7d377a66c4A803bbB457b4541e5ec62b1dCe2Ad3";

  const TIMELOCK = "0xf8D15c3132eFA557989A1C9331B6667Ca8Caa3a9";

  const APPROVAL_MODULE = "0x05a9C4a400cfA64C9639cc2f00B2CF95710f9af1";

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

    governorApprovalModule: APPROVAL_MODULE,

    delegationModel: DELEGATION_MODEL.PARTIAL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
