import { type TenantNamespace } from "@/lib/types";

import {
  TenantContractDefinition,
  TenantContractType,
} from "@/lib/tenantContractDefinition";
import {
  AlligatorOPV5__factory,
  OptimismGovernor__factory,
  type OptimismToken,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import provider from "@/app/lib/provider";
import { BaseContract } from "ethers";

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isProd: boolean
  ): TenantContractDefinition<BaseContract>[] {
    switch (namespace) {
      case "optimism":
        return optimismContracts(isProd);
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}

const optimismContracts = (
  isProd: boolean
): TenantContractDefinition<BaseContract>[] => {
  return [
    new TenantContractDefinition<BaseContract>({
      type: TenantContractType.GOVERNOR,
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
          : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
        provider
      ),
      address: isProd
        ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
        : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
      chainId: 10,
      abi: OptimismGovernor__factory.abi,
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
    }),
    new TenantContractDefinition<BaseContract>({
      type: TenantContractType.TYPES_CONFIGURATOR,
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
          : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
        provider
      ),
      address: isProd
        ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
        : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
      chainId: 10,
      abi: ProposalTypesConfigurator__factory.abi,
    }),
    new TenantContractDefinition<OptimismToken>({
      type: TenantContractType.TOKEN,
      contract: OptimismToken__factory.connect(
        "0x4200000000000000000000000000000000000042",
        provider
      ),
      address: "0x4200000000000000000000000000000000000042" as `0x${string}`,
      chainId: 10,
      abi: OptimismToken__factory.abi,
    }),
    new TenantContractDefinition<BaseContract>({
      type: TenantContractType.ALLIGATOR,
      contract: AlligatorOPV5__factory.connect(
        isProd
          ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
          : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
        provider
      ),
      address: isProd
        ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
        : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
      chainId: 10,
      abi: AlligatorOPV5__factory.abi,
    }),
  ];
};
