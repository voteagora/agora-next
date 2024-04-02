import { TenantContracts, type TenantNamespace } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";

import {
  AlligatorOPV5__factory,
  EtherfiToken__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";

import provider, { ethProvider, sepoliaProvider } from "@/app/lib/provider";

import { BaseContract } from "ethers";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isProd: boolean
  ): TenantContracts {
    switch (namespace) {
      case TENANT_NAMESPACES.ETHERFI:
        return ethfiContracts(isProd);
      case TENANT_NAMESPACES.ENS:
        return ensContracts(isProd);
      case TENANT_NAMESPACES.OPTIMISM:
        return opContracts(isProd);
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}

const ensContracts = (isProd: boolean): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      contract: EtherfiToken__factory.connect(
        "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67",
        sepoliaProvider
      ),
      address: "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67" as `0x${string}`,
      chainId: 11155111,
      chainName: "Sepolia Testnet",
      abi: EtherfiToken__factory.abi,
    }),
    // GOVERNOR
    // TODO: Implement Sepolia provider
    governor: new TenantContract<IGovernorContract>({
      contract: OptimismGovernor__factory.connect(
        isProd
          ? "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67"
          : "0xca83e6932cf4f03cdd6238be0ffcf2fe97854f67",
        sepoliaProvider
      ),
      address: "0x630A6A268191c654ce084aAd2D7910fF651e0797",
      chainId: 11155111,
      chainName: "Sepolia Testnet",
      abi: OptimismGovernor__factory.abi,
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
    }),
  };
};

const ethfiContracts = (isProd: boolean): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      contract: EtherfiToken__factory.connect(
        "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB",
        ethProvider
      ),
      address: "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB" as `0x${string}`,
      chainId: 1,
      chainName: "Ethereum Mainnet",
      abi: EtherfiToken__factory.abi,
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
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
      chainName: "Optimism",
      abi: OptimismGovernor__factory.abi,
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
    }),
  };
};

const opContracts = (isProd: boolean): TenantContracts => {
  return {
    // TOKEN
    token: new TenantContract<ITokenContract>({
      contract: OptimismToken__factory.connect(
        "0x4200000000000000000000000000000000000042",
        provider
      ),
      address: "0x4200000000000000000000000000000000000042" as `0x${string}`,
      chainId: 10,
      chainName: "Optimism",
      abi: OptimismToken__factory.abi,
    }),
    // GOVERNOR
    governor: new TenantContract<IGovernorContract>({
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
      chainName: "Optimism",
      abi: OptimismGovernor__factory.abi,
      v6UpgradeBlock: isProd ? 114995000 : 114615036,
      optionBudgetChangeDate: new Date("2024-02-21T12:00:00"),
    }),
    // ALLIGATOR
    alligator: new TenantContract<IAlligatorContract>({
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
      chainName: "Optimism",
      abi: AlligatorOPV5__factory.abi,
    }),
    // TYPES
    proposalTypesConfigurator: new TenantContract<BaseContract>({
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
      chainName: "Optimism",
      abi: ProposalTypesConfigurator__factory.abi,
    }),
  };
};
