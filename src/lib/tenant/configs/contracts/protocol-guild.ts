import {
  AgoraGovernor_11__factory,
  AgoraTimelock__factory,
  ProposalTypesConfigurator__factory,
  Membership__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, BaseContract } from "ethers";
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

export const protocolGuildTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xB3E34f8eFE825dD84137124f4A552c049BB0EC42"
    : "0xB3E34f8eFE825dD84137124f4A552c049BB0EC42";

  const GOVERNOR = isProd
    ? "0x5cA68E30dFf2A96C1e06eE1bF8609096a806f692"
    : "0x1ec062fc98be10314cf902d5aa101403d2acbf73";

  const TIMELOCK = isProd
    ? "0x0cabe65b0adc1634f56ea66a36abb70f2d4232c5"
    : "0xeba09e62142052831fe0ccdd73476ca5ce84b2f1";

  const TYPES = isProd
    ? "0x368723068b6c762b416e5a7d506a605e8b816c22"
    : "0xf8d15c3132efa557989a1c9331b6667ca8caa3a9";

  const TREASURY = isProd
    ? [
        TIMELOCK,
        "0x14c7dd468a86c4bd722927a815e923e60565c1b2",
        "0x25941dc771bb64514fc8abbce970307fb9d477e9",
      ]
    : [
        TIMELOCK,
        "0x14c7dd468a86c4bd722927a815e923e60565c1b2",
        "0x25941dc771bb64514fc8abbce970307fb9d477e9",
      ];

  const provider = isProd
    ? new AlchemyProvider("mainnet", alchemyId)
    : new AlchemyProvider("sepolia", alchemyId);

  const chain = isProd ? mainnet : sepolia;

  return {
    token: createTokenContract({
      abi: Membership__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: chain,
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
      abi: ProposalTypesConfigurator__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfigurator__factory.connect(TYPES, provider),
      provider,
    }),

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
