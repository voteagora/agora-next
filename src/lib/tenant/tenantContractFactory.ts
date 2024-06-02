import { TenantContracts, type TenantNamespace } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";

import {
  AlligatorOPV5__factory,
  EtherfiToken__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
  AgoraChangelog__factory,
} from "@/lib/contracts/generated";

import provider, { ethProvider } from "@/app/lib/provider";

import { BaseContract } from "ethers";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { mainnet, optimism, sepolia } from "viem/chains";

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isProd: boolean
  ): TenantContracts {
    const agoraChangelog = createAgoraChangelog(isProd);
    switch (namespace) {
      case TENANT_NAMESPACES.ETHERFI:
        return ethfiContracts(isProd, agoraChangelog);
      case TENANT_NAMESPACES.ENS:
        return ensContracts(isProd, agoraChangelog);
      case TENANT_NAMESPACES.OPTIMISM:
        return opContracts(isProd, agoraChangelog);
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}

const createAgoraChangelog = (
  isProd: boolean
): TenantContract<BaseContract> => {
  const agoraChangelogAddress = isProd
    ? "0x1c19a1578BB7660620588f236A353A7Bf138798a"
    : "0x1b4Bf361709f016f8F561bF1e2DFfe56C0935f13";

  return new TenantContract<BaseContract>({
    abi: AgoraChangelog__factory.abi,
    address: agoraChangelogAddress,
    chain: optimism,
    contract: AgoraChangelog__factory.connect(agoraChangelogAddress, provider),
  });
};

const ensContracts = (
  isProd: boolean,
  agoraChangelog: TenantContract<BaseContract>
): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72" as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(
        "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
        ethProvider
      ),
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
      abi: OptimismGovernor__factory.abi,
      address: isProd
        ? "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67"
        : "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67",
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67"
          : "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67",
        provider
      ),
      chain: mainnet,
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
    }),
    // Changelog
    changelog: agoraChangelog,
  };
};

const ethfiContracts = (
  isProd: boolean,
  agoraChangelog: TenantContract<BaseContract>
): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB" as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(
        "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB",
        ethProvider
      ),
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
      abi: OptimismGovernor__factory.abi,
      address: isProd
        ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
        : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
      chain: mainnet,
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
          : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
        provider
      ),
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
    }),
    // Changelog
    changelog: agoraChangelog,
  };
};

const opContracts = (
  isProd: boolean,
  agoraChangelog: TenantContract<BaseContract>
): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      abi: OptimismToken__factory.abi,
      address: "0x4200000000000000000000000000000000000042" as `0x${string}`,
      chain: optimism,
      contract: OptimismToken__factory.connect(
        "0x4200000000000000000000000000000000000042",
        provider
      ),
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
      abi: OptimismGovernor__factory.abi,
      address: isProd
        ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
        : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
      chain: optimism,
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
          : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
        provider
      ),
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
    }),
    // ALLIGATOR
    alligator: new TenantContract<IAlligatorContract>({
      abi: AlligatorOPV5__factory.abi,
      address: isProd
        ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
        : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
      chain: optimism,
      contract: AlligatorOPV5__factory.connect(
        isProd
          ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
          : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
        provider
      ),
    }),
    // TYPES
    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator__factory.abi,
      address: isProd
        ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
        : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
      chain: optimism,
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
          : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
        provider
      ),
    }),
    // Changelog
    changelog: agoraChangelog,
  };
};
