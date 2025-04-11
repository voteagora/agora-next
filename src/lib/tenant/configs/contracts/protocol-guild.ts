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
    ? "0x27b0031c64f4231f0aff28e668553d73f48125f3"
    : "0x27b0031c64f4231f0aff28e668553d73f48125f3";

  const GOVERNOR = isProd
    ? "0xe35caf04cd55192c04c93f3b1779a13f503e5942"
    : "0xa6388314fe37484883266970967ab918996f3bf0";

  const TIMELOCK = isProd
    ? "0x7751f14e211150F54D9ADD4727f7D6E9a07d4cDb"
    : "0x184ad2fD9959b8F5C247Ff1188114Dffd12069a0";

  const TYPES = isProd
    ? "0x7ca4a290a00a99829cdd6ed9d25d6e77e5544499"
    : "0xb7687e62d6b2cafb3ed3c3c81b0b6cf0a3884602";

  const TREASURY = [TIMELOCK];

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
