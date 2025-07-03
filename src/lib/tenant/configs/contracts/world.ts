import {
  AgoraGovernor_20__factory,
  AgoraTimelock_20__factory,
  ERC20__factory,
  ProposalTypesConfigurator_20__factory,
  WorldIdVotingModule__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { BaseContract, JsonRpcProvider } from "ethers";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
  ZERO_ADDRESS,
} from "@/lib/constants";
import { worldchain } from "viem/chains";
import { createTokenContract } from "@/lib/tokenUtils";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

interface Props {
  isProd: boolean;
  alchemyId: string;
}
export const worldTenantConfig = ({ alchemyId }: Props): TenantContracts => {
  const TOKEN = ZERO_ADDRESS;

  const GOVERNOR = "0x2809b50B42F0F6a7183239416cfB19f27EA8A412";

  const TYPES = "0xD2bA4C53732054521910b45B376ed6cEDE7E3fFf";

  const TIMELOCK = "0x10374c5d846179ba9ac03b468497b58e13c5f74e";

  const VOTING_MODULE = "0x9Ade288C74eA1e31c730B52dbC7453a6d3802148";

  const provider = new JsonRpcProvider(
    `https://worldchain-mainnet.g.alchemy.com/v2/${alchemyId}`
  );
  const chain = worldchain;

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
      abi: AgoraGovernor_20__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor_20__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: AgoraTimelock_20__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock_20__factory.connect(TIMELOCK, provider),
      provider,
    }),

    votingModule: new TenantContract<BaseContract>({
      abi: WorldIdVotingModule__factory.abi,
      address: VOTING_MODULE,
      chain,
      contract: WorldIdVotingModule__factory.connect(VOTING_MODULE, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator_20__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfigurator_20__factory.connect(TYPES, provider),
      provider,
    }),

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA_20,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
