import {
  AgoraGovernor_11__factory,
  AgoraTimelock__factory,
  ProposalTypesConfiguratorScopes__factory,
  Membership__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const shapeTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x10374c5D846179BA9aC03b468497B58E13C5f74e"
    : "0x10374c5D846179BA9aC03b468497B58E13C5f74e";

  const GOVERNOR = isProd
    ? "0x90193C961A926261B756D1E5bb255e67ff9498A1"
    : "0x90193C961A926261B756D1E5bb255e67ff9498A1";

  const TIMELOCK = isProd
    ? "0x34A1D3fff3958843C43aD80F30b94c510645C316"
    : "0x34A1D3fff3958843C43aD80F30b94c510645C316";

  const TYPES = isProd
    ? "0x98607C6D56bD3Ea5a1B516Ce77E07CA54e5f3FFf"
    : "0x98607C6D56bD3Ea5a1B516Ce77E07CA54e5f3FFf";

  const APPROVAL_MODULE = isProd
    ? "0xFC2e70210150855314EA9321406d01a621812148"
    : "0xFC2e70210150855314EA9321406d01a621812148";

  const TREASURY = [TIMELOCK];

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? mainnet : sepolia;

  return {
    token: createTokenContract({
      abi: Membership__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: chain,
      contract: Membership__factory.connect(TOKEN, provider),
      provider,
      type: "erc721",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor_11__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor_11__factory.connect(GOVERNOR, provider),
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
      abi: ProposalTypesConfiguratorScopes__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfiguratorScopes__factory.connect(
        TYPES,
        provider
      ),
      provider,
    }),

    treasury: TREASURY,

    governorApprovalModule: APPROVAL_MODULE,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA_20,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
