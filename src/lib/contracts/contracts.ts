import {
  AlligatorOPV5__factory,
  NounsGovernor__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
} from "./generated";
import provider from "@/app/lib/provider";

export const OptimismContracts = {
  governor: {
    contract: OptimismGovernor__factory.connect(
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
        ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
        : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
      provider
    ),
    address: (process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
      ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
      : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f") as `0x${string}`,
    chainId: 10,
    abi: OptimismGovernor__factory.abi,
    v6UpgradeBlock:
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ? 114615036 : 114615036, // TODO: Update this once prod is upgraded
  },

  proposalTypesConfigurator: {
    contract: OptimismGovernor__factory.connect(
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
        ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
        : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
      provider
    ),
    address: (process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
      ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
      : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7") as `0x${string}`,
    chainId: 10,
    abi: ProposalTypesConfigurator__factory.abi,
  },

  token: {
    contract: OptimismToken__factory.connect(
      "0x4200000000000000000000000000000000000042",
      provider
    ),
    address: "0x4200000000000000000000000000000000000042" as `0x${string}`,
    chainId: 10,
    abi: OptimismToken__factory.abi,
  },

  alligator: {
    contract: AlligatorOPV5__factory.connect(
      "0x7f08F3095530B67CdF8466B7a923607944136Df0",
      provider
    ),
    address: "0x7f08F3095530B67CdF8466B7a923607944136Df0",
    chainId: 10,
    abi: AlligatorOPV5__factory.abi,
  },
};

export const opAdminAddress =
  "0x2501c477D0A35545a387Aa4A3EEe4292A9a8B3F0" as `0x${string}`;

export const approvalModuleAddress =
  "0xdd0229D72a414DC821DEc66f3Cc4eF6dB2C7b7df" as `0x${string}`;

export const optimisticModuleAddress =
  "0x27964c5f4F389B8399036e1076d84c6984576C33";

export const NounsContracts = {
  governor: {
    contract: NounsGovernor__factory.connect(
      "0x6f3e6272a167e8accb32072d08e0957f9c79223d",
      provider
    ),
    address: "0x6f3e6272a167e8accb32072d08e0957f9c79223d" as `0x${string}`,
    chainId: 1,
    abi: NounsGovernor__factory.abi,
  },
};

export const isOldApprovalModule = (block_number: string) => {
  return Number(block_number) < OptimismContracts.governor.v6UpgradeBlock;
};
