import {
  NounsGovernor__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
} from "./generated";
import provider from "@/app/lib/provider";

export const OptimismContracts = {
  governor: OptimismGovernor__factory.connect(
    "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10",
    provider
  ),

  token: OptimismToken__factory.connect(
    "0x4200000000000000000000000000000000000042",
    provider
  ),
};

export const NounsContracts = {
  governor: NounsGovernor__factory.connect(
    "0x6f3e6272a167e8accb32072d08e0957f9c79223d",
    provider
  ),
};
