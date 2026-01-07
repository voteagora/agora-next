import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ERC20__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { createTokenContract } from "@/lib/tokenUtils";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";
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

export const xaiTenantConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0x9d9c7d3C7ffe27b8F7b7e6d80AaDeFEC12453A21"
    : "0x415777DeB21bde51369F2218db4618e61419D4Dc";

  const GOVERNOR = isMain
    ? "0x14BDED20143C563D3898C01A6e9E7a68De43Ce1F"
    : "0xD89f0BAB19e31EfEaa89fC625E3f08050d65CF33";

  // TODO: wasn't sure what to put here so defaulting to timelock
  const TREASURY = isMain
    ? ["0x23C70cB62A7FC60AE7118c33068eF42c125654Bc"]
    : ["0x5d729d4c0bf5d0a2fa0f801c6e0023bd450c4fd6"];

  const TYPES = isMain
    ? "0x05a9C4a400cfA64C9639cc2f00B2CF95710f9af1"
    : "0x7d377a66c4a803bbb457b4541e5ec62b1dce2ad3";

  const TIMELOCK = isMain
    ? "0x23C70cB62A7FC60AE7118c33068eF42c125654Bc"
    : "0x5d729d4c0bf5d0a2fa0f801c6e0023bd450c4fd6";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("arbitrum", alchemyId)
      : new AlchemyProvider("arbitrum-sepolia", alchemyId);

  const chain = isMain ? arbitrum : arbitrumSepolia;

  const providerForTime = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL) // TODO: Setup a second anvil fork for actual time for E2E tests.  E2E tests related to time will just be wrong or fail for XAI until we fix this.
    : isMain
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chainForTime = isMain ? mainnet : sepolia;

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

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    chainForTime,
    providerForTime,
  };
};
