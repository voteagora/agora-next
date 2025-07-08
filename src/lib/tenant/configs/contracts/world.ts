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
export const worldTenantConfig = ({
  alchemyId,
  isProd,
}: Props): TenantContracts => {
  const TOKEN = ZERO_ADDRESS;

  const GOVERNOR = isProd
    ? "0x785553111A66B88E3D0cef523C3A2c6D821e675B"
    : "0x2809b50B42F0F6a7183239416cfB19f27EA8A412";

  const TYPES = isProd
    ? "0x2E6471bAd19EC74824A886c256019363b32A3fFF"
    : "0xD2bA4C53732054521910b45B376ed6cEDE7E3fFf";

  const TIMELOCK = isProd
    ? "0xdA81f43Ba4A59Bf9B432EA8A6506d4cAb0a69589"
    : "0x10374c5d846179ba9ac03b468497b58e13c5f74e";

  const VOTING_MODULE = isProd
    ? "0x6253380b35540ba93F399cF40b1B52B550312148"
    : "0xbF6187867c1EF9B17D0c9Ab2122Fa52BEDfa2148";

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
