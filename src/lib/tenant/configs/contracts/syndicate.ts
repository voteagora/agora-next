import {
  AgoraToken__factory,
  AgoraGovernor__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { optimism } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, JsonRpcProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { DELEGATION_MODEL } from "@/lib/constants";

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
    ? "0xd5741323b3ddfe5556c3477961b5160600c29c53" // Placeholder for prod
    : "0xd5741323b3ddfe5556c3477961b5160600c29c53"; // Placeholder for dev

  // dummy addresses; for now: syndicate is info-only
  const DUMMY_GOVERNOR = "0x95a35Cd8638b732E839C6CCDD0d8B7FA06319677";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : new AlchemyProvider("optimism", alchemyId);

  const chain = optimism;

  return {
    token: createTokenContract({
      abi: AgoraToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: AgoraToken__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor__factory.abi,
      address: DUMMY_GOVERNOR,
      chain,
      contract: AgoraGovernor__factory.connect(DUMMY_GOVERNOR, provider),
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
  };
};
