import {
  UniswapToken__factory,
  UniswapGovernor__factory,
  UniswapStaker__factory,
  UniswapTimelock__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { GovernorInstance, TenantContracts } from "@/lib/types";
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
  isProd: boolean;
  alchemyId: string;
}

export const uniswapTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    : "0xc796953c443f542728eedf33aab32753d3f7a91a";

  const GOVERNOR = isProd
    ? "0x408ED6354d4973f66138C91495F2f2FCbd8724C3"
    : "0x58b9952016d19bf2c6cb62f398dcde6a22278aaa";

  const STAKER = isProd
    ? "0xe3071e87a7e6dd19a911dbf1127ba9dd67aa6fc8"
    : "0x8019fc84c804a9de8f0bcffb5cf90d9982d3f8c5";

  const TIMELOCK = isProd
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
    : isProd
      ? new AlchemyProvider("mainnet", alchemyId)
      : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? mainnet : sepolia;

  const token = createTokenContract({
    abi: UniswapToken__factory.abi,
    address: TOKEN as `0x${string}`,
    chain,
    contract: UniswapToken__factory.connect(TOKEN, provider),
    provider,
    type: "erc20",
  });

  const governor = new TenantContract<IGovernorContract>({
    abi: UniswapGovernor__factory.abi,
    address: GOVERNOR,
    chain,
    contract: UniswapGovernor__factory.connect(GOVERNOR, provider),
    provider,
  });

  const timelock = new TenantContract<ITimelockContract>({
    abi: UniswapTimelock__factory.abi,
    address: TIMELOCK,
    chain,
    contract: UniswapTimelock__factory.connect(TIMELOCK, provider),
    provider,
  });

  // ENS contracts as a second governor instance for multi-governor testing
  const SECONDARY_TOKEN = isProd
    ? "0xc796953c443f542728eedf33aab32753d3f7a91a"
    : "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67";
  const SECONDARY_GOVERNOR = isProd
    ? "0x58b9952016d19bf2c6cb62f398dcde6a22278aaa"
    : "0xb65c031ac61128ae791d42ae43780f012e2f7f89";
  const SECONDARY_TIMELOCK = isProd
    ? "0xb90021440D94e32448387d8b06851f5C4F7b0a49"
    : "0x1E9BE5E89AE5ccBf047477Ac01D3d4b0eBFB328e";

  const secondaryToken = createTokenContract({
    abi: UniswapToken__factory.abi, // Use UniswapToken ABI for consistency
    address: SECONDARY_TOKEN as `0x${string}`,
    chain,
    contract: UniswapToken__factory.connect(SECONDARY_TOKEN, provider),
    provider,
    type: "erc20",
  });

  const secondaryGovernor = new TenantContract<IGovernorContract>({
    abi: UniswapGovernor__factory.abi,
    address: SECONDARY_GOVERNOR,
    chain,
    contract: UniswapGovernor__factory.connect(SECONDARY_GOVERNOR, provider),
    provider,
  });

  const secondaryTimelock = new TenantContract<ITimelockContract>({
    abi: UniswapTimelock__factory.abi,
    address: SECONDARY_TIMELOCK,
    chain,
    contract: UniswapTimelock__factory.connect(SECONDARY_TIMELOCK, provider),
    provider,
  });

  const governors: GovernorInstance[] = [
    {
      id: "uniswap-main",
      label: "Uniswap",
      governor,
      timelock,
      token,
      governorType: GOVERNOR_TYPE.BRAVO,
      timelockType: TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL,
      treasury: TREASURY,
    },
    {
      id: "uniswap-secondary",
      label: "coincil",
      governor: secondaryGovernor,
      timelock: secondaryTimelock,
      token: secondaryToken,
      governorType: GOVERNOR_TYPE.BRAVO,
      timelockType: TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL,
    },
  ];

  return {
    token,

    staker: new TenantContract<IStaker>({
      abi: UniswapStaker__factory.abi,
      address: STAKER,
      chain,
      contract: UniswapStaker__factory.connect(STAKER, provider),
      provider,
    }),

    governor,
    timelock,
    governors,

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.BRAVO,
    timelockType: TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL,
  };
};
