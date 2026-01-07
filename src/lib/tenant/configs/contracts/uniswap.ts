import {
  UniswapToken__factory,
  UniswapGovernor__factory,
  UniswapStaker__factory,
  UniswapTimelock__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";
import { AlchemyProvider, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isMain: boolean;
  alchemyId: string;
}

export const uniswapTenantContractConfig = ({
  isMain,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isMain
    ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    : "0xc796953c443f542728eedf33aab32753d3f7a91a";

  const GOVERNOR = isMain
    ? "0x408ED6354d4973f66138C91495F2f2FCbd8724C3"
    : "0x58b9952016d19bf2c6cb62f398dcde6a22278aaa";

  const STAKER = isMain
    ? "0xe3071e87a7e6dd19a911dbf1127ba9dd67aa6fc8"
    : "0x8019fc84c804a9de8f0bcffb5cf90d9982d3f8c5";

  const TIMELOCK = isMain
    ? "0x1a9C8182C09F50C8318d769245beA52c32BE35BC"
    : "0xb90021440D94e32448387d8b06851f5C4F7b0a49";

  // Right now there are no sepolia treasury accounts for uniswap.
  // They are set to match.
  const TREASURY = [
    "0x1a9c8182c09f50c8318d769245bea52c32be35bc",
    "0xe571dC7A558bb6D68FfE264c3d7BB98B0C6C73fC",
    "0x3D30B1aB88D487B0F3061F40De76845Bec3F1e94",
  ];

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isMain
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isMain ? mainnet : sepolia;

  return {
    token: createTokenContract({
      abi: UniswapToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: UniswapToken__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    staker: new TenantContract<IStaker>({
      abi: UniswapStaker__factory.abi,
      address: STAKER,
      chain,
      contract: UniswapStaker__factory.connect(STAKER, provider),
      provider,
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: UniswapGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: UniswapGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: UniswapTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: UniswapTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.BRAVO,
    timelockType: TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL,
  };
};
