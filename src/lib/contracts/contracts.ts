import {
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
  },

  proposalTypesConfigurator: {
    contract: OptimismGovernor__factory.connect(
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
        ? ""
        : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
      provider
    ),
    address: (process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
      ? ""
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
};

export const opAdminAddress =
  "0x2501c477D0A35545a387Aa4A3EEe4292A9a8B3F0" as `0x${string}`;

export const approvalModuleAddress = (
  process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
    ? "0x54A8fCBBf05ac14bEf782a2060A8C752C7CC13a5"
    : "0xdd0229D72a414DC821DEc66f3Cc4eF6dB2C7b7df"
) as `0x${string}`;

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
