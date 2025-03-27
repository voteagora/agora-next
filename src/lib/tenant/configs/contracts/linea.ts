import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ERC20__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { linea, lineaSepolia } from "viem/chains";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const lineaTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xDa235d2fa0089F38e756c70a10fF6c6e33b2616f"
    : "0xDa235d2fa0089F38e756c70a10fF6c6e33b2616f";

  const GOVERNOR = isProd
    ? "0x89527f98815A981bc54c75853135348b3d0f7838"
    : "0x89527f98815A981bc54c75853135348b3d0f7838";

  const TYPES = isProd
    ? "0x50E86399DDb16E9DbbeD6A9E9DF07CC724d31fEA"
    : "0x50E86399DDb16E9DbbeD6A9E9DF07CC724d31fEA";

  const TIMELOCK = isProd
    ? "0x375039472E76B393b6ea945eeb1478c869CF8618"
    : "0x375039472E76B393b6ea945eeb1478c869CF8618";

  const APPROVAL_MODULE = isProd
    ? "0xF23C23d65fDDD549818CF81E37A32D15f44048C8"
    : "0xF23C23d65fDDD549818CF81E37A32D15f44048C8";

  const provider = new JsonRpcProvider(
    isProd
      ? `https://linea-mainnet.g.alchemy.com/v2/${alchemyId}`
      : `https://linea-sepolia.g.alchemy.com/v2/${alchemyId}`
  );

  const chain = isProd ? linea : lineaSepolia;

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
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor__factory.connect(GOVERNOR, provider),
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

    governorApprovalModule: APPROVAL_MODULE,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
  };
};
