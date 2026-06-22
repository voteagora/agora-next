import {
  AgoraGovernor_11__factory,
  AgoraTimelock__factory,
  Membership__factory,
  ProposalTypesConfiguratorScopes__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { base, baseSepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { getRpcUrlForChain } from "@/lib/rpcConfig";

interface Props {
  isProd: boolean;
  rpcSecret: string;
}

export const civicTenantConfig = ({
  isProd,
  rpcSecret,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x234653cfb2ff6d0771fb6c615f5a61af1a9518c7"
    : "0x0000000000000000000000000000000000000000";

  const GOVERNOR = isProd
    ? "0xd796754d50983797788aa3bf5faf3f03f48e3d79"
    : "0x0000000000000000000000000000000000000000";

  const TIMELOCK = isProd
    ? "0x6d592fc5a41ee3bb25683832e52a2facef71cd81"
    : "0x0000000000000000000000000000000000000000";

  const TYPES = isProd
    ? "0xd528e273857020722de4b5284de4379b78782f8a"
    : "0x0000000000000000000000000000000000000000";

  const TREASURY = [TIMELOCK];
  const chain = isProd ? base : baseSepolia;
  const provider = new JsonRpcProvider(getRpcUrlForChain(chain.id, rpcSecret));

  return {
    token: createTokenContract({
      abi: Membership__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: Membership__factory.connect(TOKEN, provider),
      provider,
      type: "erc721",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor_11__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor_11__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfiguratorScopes__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfiguratorScopes__factory.connect(
        TYPES,
        provider
      ),
      provider,
    }),

    treasury: TREASURY,
    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
