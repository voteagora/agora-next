import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ERC20__factory,
  ProposalTypesConfigurator__factory,
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
import { base } from "viem/chains";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const b3TenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xB3B32F9f8827D4634fE7d973Fa1034Ec9fdDB3B3"
    : "0x375039472E76B393b6ea945eeb1478c869CF8618";

  const GOVERNOR = isProd
    ? "0x4d56a1F3dAB23A0518536C3f42A78B21198Fb30c"
    : "0xE1d4E3a4926A91385b2081D1167127D3E0151A26";

  const TYPES = isProd
    ? "0x7d377a66c4A803bbB457b4541e5ec62b1dCe2Ad3"
    : "0x5F47B13d9930FF115da90c6CEa7Db88D297aC2Fe";

  const TIMELOCK = isProd
    ? "0x5d729d4c0BF5d0a2Fa0F801c6e0023BD450c4fd6"
    : "0xaDe915ec0208a77d464C4837b252bC6a822F457A";

  const APPROVAL_MODULE = isProd
    ? "0x4990CcE6e8CD9596305b83C4860D4C0f3Bf4e8fa"
    : "0x2c349e564037e184Fe787CA4906C53507c70A7E0";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : new AlchemyProvider("base", alchemyId);

  const chain = base;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
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

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
