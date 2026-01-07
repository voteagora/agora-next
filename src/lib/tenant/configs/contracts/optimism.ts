import {
  AlligatorOPV5__factory,
  ERC20__factory,
  OptimismGovernor__factory,
  ProposalTypesConfigurator__factory,
  AgoraTimelock__factory,
  VotableSupplyOracle__factory,
} from "@/lib/contracts/generated";
import { AlchemyProvider, BaseContract, JsonRpcProvider } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { optimism, optimismSepolia } from "viem/chains";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { IVotableSupplyOracleContract } from "@/lib/contracts/common/interfaces/IVotableSupplyOracleContract";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const optimismTenantContractConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0x4200000000000000000000000000000000000042"
    : "0xd828b681F717E5a03C41540Bc6A31b146b5C1Ac6";

  const GOVERNOR = isMain
    ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
    : "0x368723068b6C762b416e5A7d506a605E8b816C22";

  const ALLIGATOR = isMain
    ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
    : "0x5d729d4c0BF5d0a2Fa0F801c6e0023BD450c4fd6";

  const TYPES = isMain
    ? "0xCE52b7cc490523B3e81C3076D5ae5Cca9a3e2D6F"
    : "0xb88131610ff4D7D46050c9d1DEE413f8b6b8A5bd";

  const TIMELOCK = isMain
    ? "0x0eDd4B2cCCf41453D8B5443FBB96cc577d1d06bF"
    : "0xf8D15c3132eFA557989A1C9331B6667Ca8Caa3a9";

  const VOTABLE_ORACLE = isMain
    ? "0x1b7CA7437748375302bAA8954A2447fC3FBE44CC"
    : "0x2451dAF2153B1293Da2abF19C36c450321835C55";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("optimism", alchemyId)
      : new AlchemyProvider("optimism-sepolia", alchemyId);

  const chain = isMain ? optimism : optimismSepolia;

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
      abi: OptimismGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
      v6UpgradeBlock: isMain ? 114995000 : 100, // TODO: get the right block number
      provider,
    }),

    alligator: new TenantContract<IAlligatorContract>({
      abi: AlligatorOPV5__factory.abi,
      address: ALLIGATOR,
      chain,
      contract: AlligatorOPV5__factory.connect(ALLIGATOR, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator__factory.abi,
      address: TYPES,
      chain,
      contract: OptimismGovernor__factory.connect(TYPES, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    votableSupplyOracle: new TenantContract<IVotableSupplyOracleContract>({
      abi: VotableSupplyOracle__factory.abi,
      address: VOTABLE_ORACLE,
      chain,
      contract: VotableSupplyOracle__factory.connect(VOTABLE_ORACLE, provider),
      provider,
    }),

    delegationModel: DELEGATION_MODEL.ADVANCED,
    governorType: GOVERNOR_TYPE.ALLIGATOR,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
