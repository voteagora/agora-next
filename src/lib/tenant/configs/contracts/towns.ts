import { TenantContracts } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract } from "ethers";
import { mainnet } from "viem/chains";
import { JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ERC20__factory } from "@/lib/contracts/generated";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const townsTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // dummy addresses; for now: towns is info-only
  const DUMMY_TOKEN = "0x0000000000000000000000000000000000000001";
  const DUMMY_GOVERNOR = "0x0000000000000000000000000000000000000002";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  // mock provider that doesn't make network requests; for now: towns is info-only
  const mockProvider = {
    getNetwork: () => Promise.resolve({ chainId: 1, name: "mainnet" }),
    getCode: () => Promise.resolve("0x"),
    getBalance: () => Promise.resolve({ value: 0n }),
    getBlock: () =>
      Promise.resolve({ number: 19000000, timestamp: 1700000000 }),
    // prevent network detection attempts
    _detectNetwork: () => Promise.resolve({ chainId: 1, name: "mainnet" }),
    ready: Promise.resolve({ chainId: 1, name: "mainnet" }),
  } as any;

  const chain = mainnet;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: DUMMY_TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(DUMMY_TOKEN, mockProvider),
      provider: mockProvider,
      type: "erc20",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: DUMMY_GOVERNOR,
      chain,
      contract: {} as IGovernorContract,
      provider: mockProvider,
    }),

    timelock: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TIMELOCK,
      chain,
      contract: {} as BaseContract,
      provider: mockProvider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TYPES,
      chain,
      contract: {} as BaseContract,
      provider: mockProvider,
    }),

    treasury: [],
  };
};
