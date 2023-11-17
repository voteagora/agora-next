import {
  NounsGovernor__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
} from "./generated";
import provider from "@/app/lib/provider";

export const OptimismContracts = {
  governor: {
    contract: OptimismGovernor__factory.connect(
      "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10",
      provider
    ),
    address: "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10",
    chainId: 10,
    abi: OptimismGovernor__factory.abi,
  },

  token: {
    contract: OptimismToken__factory.connect(
      "0x4200000000000000000000000000000000000042",
      provider
    ),
    address: "0x4200000000000000000000000000000000000042",
    chainId: 10,
    abi: OptimismToken__factory.abi,
  },
};

export const NounsContracts = {
  governor: {
    contract: NounsGovernor__factory.connect(
      "0x6f3e6272a167e8accb32072d08e0957f9c79223d",
      provider
    ),
    address: "0x6f3e6272a167e8accb32072d08e0957f9c79223d",
    chainId: 1,
    abi: NounsGovernor__factory.abi,
  },
};
