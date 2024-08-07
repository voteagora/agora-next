import {
  AlligatorOPV5__factory,
  ERC20__factory,
  OptimismGovernor__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { AlchemyProvider, BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { optimism } from "viem/chains";

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
    ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
    : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7";

  const provider = new AlchemyProvider("optimism", alchemyId);
  const chain = optimism;

  return {
    token: new TenantContract<ITokenContract>({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
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
  };
};
