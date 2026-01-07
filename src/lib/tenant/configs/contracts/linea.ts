import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  AgoraToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { linea, lineaSepolia } from "viem/chains";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const lineaTenantConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0x03A61C68BF297aDffF451426ea8C491bb8F87c65"
    : "0x03A61C68BF297aDffF451426ea8C491bb8F87c65";

  const GOVERNOR = isMain
    ? "0x50D54Aa44f5B8bda554A7abda6046c3962b71AF9"
    : "0x50D54Aa44f5B8bda554A7abda6046c3962b71AF9";

  const TYPES = isMain
    ? "0xb6992f1f0659820f3DAF4ebDD16FaFD6ea9EF8eB"
    : "0xb6992f1f0659820f3DAF4ebDD16FaFD6ea9EF8eB";

  const TIMELOCK = isMain
    ? "0xc5624d0Bc88A1C654cc968f9E741F1B448c1B897"
    : "0xc5624d0Bc88A1C654cc968f9E741F1B448c1B897";

  const APPROVAL_MODULE = isMain
    ? "0xD9B569a18FDA0B9e9b983eec885E065f032da1F7"
    : "0xD9B569a18FDA0B9e9b983eec885E065f032da1F7";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new JsonRpcProvider(
          "https://linea-mainnet.g.alchemy.com/v2/${alchemyId}"
        )
      : new JsonRpcProvider(
          "https://linea-sepolia.g.alchemy.com/v2/${alchemyId}"
        );

  const chain = isMain ? linea : lineaSepolia;

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
    supportScopes: true,
  };
};
