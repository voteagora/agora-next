import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  CyberProposalTypes__factory,
  ERC20__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import { DELEGATION_MODEL } from "@/lib/constants";
import { base } from "viem/chains";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const b3TenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xB3B32F9f8827D4634fE7d973Fa1034Ec9fdDB3B3"
    : "0x00CcC87b111EA3B0FE5702Bb3AEd9edEd965def7";

  const GOVERNOR = isProd
    ? "0x4d56a1F3dAB23A0518536C3f42A78B21198Fb30c"
    : "0xD95E7e8f8Aa0c7405c5b24e015ce774Ed044b594";

  const TYPES = isProd
    ? "0x7d377a66c4A803bbB457b4541e5ec62b1dCe2Ad3"
    : "0x7751f14e211150F54D9ADD4727f7D6E9a07d4cDb";

  const TIMELOCK = isProd
    ? "0x5d729d4c0BF5d0a2Fa0F801c6e0023BD450c4fd6"
    : "0xb5d3D252f1897f1c6829a9E42068Ee8e54Fb3659";

  const APPROVAL_MODULE = isProd
    ? "0x4990CcE6e8CD9596305b83C4860D4C0f3Bf4e8fa"
    : "0x1986516d07ABEddF8107F98b443F21ECFEE1d164";

  const provider = new AlchemyProvider("base", alchemyId);
  const chain = base;

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
  };
};
