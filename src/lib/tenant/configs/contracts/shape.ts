import { TenantContracts } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, AlchemyProvider, JsonRpcProvider } from "ethers";
import { shape, shapeSepolia } from "viem/chains";
import { createTokenContract } from "@/lib/tokenUtils";
import { ERC20__factory } from "@/lib/contracts/generated";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const shapeTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x360aAC543A23dbcefA8049d4C4d8B18dA1CCa360" // Shape mainnet (prod)
    : "0x4200000000000000000000000000000000000042"; // GovernanceToken on Shape Sepolia

  // dummy addresses; info-only (no-gov) like towns
  const DUMMY_GOVERNOR = "0x0000000000000000000000000000000000000002";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("shape-mainnet", alchemyId)
      : new AlchemyProvider("shape-sepolia", alchemyId);
  const chain = isProd ? shape : shapeSepolia;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: DUMMY_GOVERNOR,
      chain,
      contract: {} as IGovernorContract,
      provider,
    }),

    timelock: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TIMELOCK,
      chain,
      contract: {} as BaseContract,
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TYPES,
      chain,
      contract: {} as BaseContract,
      provider,
    }),

    treasury: [],
  };
};
