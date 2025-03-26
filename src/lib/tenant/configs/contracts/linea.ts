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
import { linea, lineaSepolia } from "viem/chains";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const lineaTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x75F37F4cFE214Dce167AAAa3455Bd1223b52BAFd"
    : "0x75F37F4cFE214Dce167AAAa3455Bd1223b52BAFd";

  const GOVERNOR = isProd
    ? "0x1Fe07cd62bD330bD0899bA9959A2B8C1b98360F8"
    : "0x1Fe07cd62bD330bD0899bA9959A2B8C1b98360F8";

  const TYPES = isProd
    ? "0x7a0f7659103cfc42f3Eeb265EDb0205bE9B25490"
    : "0x7a0f7659103cfc42f3Eeb265EDb0205bE9B25490";

  const TIMELOCK = isProd
    ? "0x7ca4a290a00A99829CdD6ED9D25D6e77e5544499"
    : "0x7ca4a290a00A99829CdD6ED9D25D6e77e5544499";

  const APPROVAL_MODULE = isProd
    ? "0x7751f14e211150F54D9ADD4727f7D6E9a07d4cDb"
    : "0x7751f14e211150F54D9ADD4727f7D6E9a07d4cDb";

  const provider = new JsonRpcProvider(
    isProd
      ? `https://linea-mainnet.g.alchemy.com/v2/${alchemyId}`
      : `https://linea-sepolia.g.alchemy.com/v2/${alchemyId}`
  );

  const chain = isProd ? linea : lineaSepolia;

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
