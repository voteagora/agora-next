import { TenantContracts } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, AlchemyProvider, JsonRpcProvider } from "ethers";
import { base, sepolia } from "viem/chains";
import { createTokenContract } from "@/lib/tokenUtils";
import {
  AgoraGovernor__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { DELEGATION_MODEL } from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const townsTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x00000000A22C618fd6b4D7E9A335C4B96B189a38"
    : "0x55f6e82a8BF5736d46837246DcBEAf7e61b3c27C";

  const DAO_ID = isProd
    ? "0x746f776e732e2e2e2e2e0000210500000030435d"
    : "0x746f776e732e2e2e2e2e00aa36a70000003d1154";

  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new AlchemyProvider("base", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? base : sepolia;

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
    delegationModel: DELEGATION_MODEL.FULL,
    treasury: [],
  };
};
