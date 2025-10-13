import { UniswapToken__factory } from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { BaseContract } from "ethers";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const syndicateTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // TODO: Replace with actual syndicate token address when available
  const TOKEN = isProd
    ? "0xc796953c443f542728eedf33aab32753d3f7a91a" // Placeholder for prod
    : "0xc796953c443f542728eedf33aab32753d3f7a91a"; // Placeholder for dev

  // dummy addresses; for now: syndicate is info-only
  const DUMMY_GOVERNOR = "0x0000000000000000000000000000000000000002";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("sepolia", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? sepolia : sepolia;

  return {
    token: createTokenContract({
      abi: UniswapToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: UniswapToken__factory.connect(TOKEN, provider),
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
