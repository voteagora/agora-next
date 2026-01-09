import {
  AgoraGovernor__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { DELEGATION_MODEL, ZERO_ADDRESS } from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const demo3TenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x0000000000000000000000000000000000000000"
    : "0xf1f9686d8144c7c5f16feffc8fdf93ec64058dec";

  const DAO_ID = isProd
    ? "0x0000000000000000000000000000000000000000"
    : "0x64656d6f332e2e2e2e2e00aa36a7000000fe1eb3";

  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = ZERO_ADDRESS;

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
      abi: AgoraGovernor__factory.abi,
      address: DAO_ID,
      chain,
      contract: AgoraGovernor__factory.connect(DAO_ID, provider),
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

    delegationModel: DELEGATION_MODEL.PARTIAL,
    treasury: [],
    easRecipient: isProd
      ? "0x0000000000000000000000000000000000000000"
      : "0x64656d6f332e2e2e2e2e00aa36a7000000fe1eb3",
  };
};
