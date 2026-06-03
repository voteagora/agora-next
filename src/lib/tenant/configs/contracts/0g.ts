import { ERC20__factory } from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const ogTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xd5741323b3ddfe5556C3477961B5160600C29c53"
    : "0xd5741323b3ddfe5556C3477961B5160600C29c53";

  const DUMMY_GOVERNOR = "0x0000000000000000000000000000000000000002";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? mainnet : sepolia;

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
