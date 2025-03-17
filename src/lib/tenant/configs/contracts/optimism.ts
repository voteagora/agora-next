import {
  AlligatorOPV5__factory,
  ERC20__factory,
  OptimismGovernor__factory,
  ProposalTypesConfigurator__factory,
  AgoraTimelock__factory,
  VotableSupplyOracle__factory,
} from "@/lib/contracts/generated";
import { AlchemyProvider, BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { optimism } from "viem/chains";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { IVotableSupplyOracleContract } from "@/lib/contracts/common/interfaces/IVotableSupplyOracleContract";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const optimismTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = "0x4200000000000000000000000000000000000042";

  const GOVERNOR = isProd
    ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
    : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f";

  const ALLIGATOR = isProd
    ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
    : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6";

  const TYPES = isProd
    ? "0xCE52b7cc490523B3e81C3076D5ae5Cca9a3e2D6F"
    : "0x2e0C197f1fca7628ADfa2bdaabd1df4670186C06";

  const TIMELOCK = isProd
    ? "0x0eDd4B2cCCf41453D8B5443FBB96cc577d1d06bF"
    : "0x85c118971C058677DC502854d56A483BF5548042";

  const VOTABLE_ORACLE = isProd
    ? "0x1b7CA7437748375302bAA8954A2447fC3FBE44CC"
    : "0x73b07b799Abfb7965f2C1014120019CbffaAcae7";

  const provider = new AlchemyProvider("optimism", alchemyId);
  const chain = optimism;

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
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
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
