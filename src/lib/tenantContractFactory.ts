import provider from "@/app/lib/provider";

import { type TenantNamespace, type TenantContracts } from "@/lib/types";
import { TenantContract } from "@/lib/tenantContract";
import {
  AlligatorOPV5__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";

export default class TenantContractFactory {
  public static create(namespace: TenantNamespace): TenantContracts {
    switch (namespace) {
      case "optimism":
        const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";

        const opContracts: TenantContracts = {
          governor: new TenantContract({
            contract: OptimismGovernor__factory.connect(
              isProd
                ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
                : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
              provider
            ),
            mainnetAddress: "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10",
            testnetAddress: "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
            chainId: 10,
            abi: OptimismGovernor__factory.abi,
            v6UpgradeBlock:
              process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
                ? 114995000
                : 114615036,
          }),

          proposalTypesConfigurator: new TenantContract({
            contract: OptimismGovernor__factory.connect(
              isProd
                ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
                : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
              provider
            ),
            mainnetAddress: "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f",
            testnetAddress: "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
            chainId: 10,
            abi: ProposalTypesConfigurator__factory.abi,
          }),

          token: new TenantContract({
            contract: OptimismToken__factory.connect(
              "0x4200000000000000000000000000000000000042",
              provider
            ),
            mainnetAddress: "0x4200000000000000000000000000000000000042",
            chainId: 10,
            abi: OptimismToken__factory.abi,
          }),

          alligator: new TenantContract({
            contract: AlligatorOPV5__factory.connect(
              isProd
                ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
                : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",

              provider
            ),
            mainnetAddress: "0x7f08F3095530B67CdF8466B7a923607944136Df0",
            testnetAddress: "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
            chainId: 10,
            abi: AlligatorOPV5__factory.abi,
          }),
        };

      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
