import {
  ENSGovernor__factory,
  ENSTimelock__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
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

export const ensTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"
    : "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67";

  const GOVERNOR = isProd
    ? "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3"
    : "0xb65c031ac61128ae791d42ae43780f012e2f7f89";

  const TIMELOCK = isProd
    ? "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7"
    : "0x1E9BE5E89AE5ccBf047477Ac01D3d4b0eBFB328e";

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
      abi: ENSGovernor__factory.abi,
      address: GOVERNOR,
      chain: chain,
      contract: ENSGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: ENSTimelock__factory.abi,
      address: TIMELOCK,
      chain: chain,
      contract: ENSTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.ENS,
    timelockType: TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL,
  };
};
