import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  Membership__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { createTokenContract } from "@/lib/tokenUtils";
import { optimism, optimismSepolia } from "viem/chains";
import { AlchemyProvider, BaseContract, JsonRpcProvider } from "ethers";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const boostTenantConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0xcDdf69F9d290F591896DD1A27cbb32E4935D47b6"
    : "0x9323dd7c1fa5f05dc1e922763ae12529133c0848";

  const GOVERNOR = isMain
    ? "0xb4e9d0ca820320ebac45a4d60b020f64f0d6d4be"
    : "0x3b66f791ae98292ecc8602bc91a0b7dacab00cbf";

  // TODO: wasn't sure what to put here so defaulting to timelock
  const TREASURY = isMain
    ? ["0x0cabe65b0adc1634f56ea66a36abb70f2d4232c5"]
    : ["0x7af51c3ed3b691a58a7ab2cd5876a33751d3bc6f"];

  const TYPES = isMain
    ? "0xa78db4a8efccd5812e0044496edcc571da3d24c6"
    : "0x736d1339634691ed06f34fb4504013a7272bf4ea";

  const TIMELOCK = isMain
    ? "0x0cabe65b0adc1634f56ea66a36abb70f2d4232c5"
    : "0x7af51c3ed3b691a58a7ab2cd5876a33751d3bc6f";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("optimism", alchemyId)
      : new AlchemyProvider("optimism-sepolia", alchemyId);

  const chain = isMain ? optimism : optimismSepolia;

  return {
    token: createTokenContract({
      abi: Membership__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: Membership__factory.connect(TOKEN, provider),
      provider,
      type: "erc721",
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

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
