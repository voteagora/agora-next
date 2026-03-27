import {
  AgoraGovernor__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { optimism, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { DELEGATION_MODEL, ZERO_ADDRESS } from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const standwithcryptoTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x9c63bb4f3315675ef5d888dec5560ea929151185"
    : "0x0000000000000000000000000000000000000000";

  const DAO_ID = isProd
    ? "0x7374616e6477697468630000000a010000d8fb3b"
    : "0x0000000000000000000000000000000000000000";

  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = ZERO_ADDRESS;

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("optimism", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? optimism : sepolia;

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
      ? "0x7374616e6477697468630000000a010000d8fb3b"
      : "0x0000000000000000000000000000000000000000",
  };
};
