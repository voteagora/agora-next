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
import { DELEGATION_MODEL } from "@/lib/constants";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const syndicateTenantConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0x1bAB804803159aD84b8854581AA53AC72455614E"
    : "0x55f6e82a8BF5736d46837246DcBEAf7e61b3c27C";

  const DAO_ID = isMain
    ? "0x73796e6469636174652e000000010100000a2f00"
    : "0x73796e6469636174652e00aa36a701000079e0f1";

  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000000";

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isMain ? mainnet : sepolia;

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
    easRecipient: isMain
      ? "0x73796e6469636174652e000000010100000a2f00"
      : "0x73796e6469636174652e00aa36a701000079e0f1",
  };
};
