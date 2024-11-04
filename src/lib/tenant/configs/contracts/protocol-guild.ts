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
import { zeroAddress } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const protocolGuildTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? zeroAddress
    : "0xd294e1f05cf829dd9f1e8fe8930c791a0d0eb52f";

  const GOVERNOR = isProd
    ? zeroAddress
    : "0x4905e25b5cba440d58fe3ad688750731b59e6307";

  const TIMELOCK = isProd
    ? zeroAddress
    : "0xeba09e62142052831fe0ccdd73476ca5ce84b2f1";

  const TYPES = isProd
    ? zeroAddress
    : "0x966daa9da3c7ef86c0f9fd678bd5d8cb1b856577";

  const TREASURY = isProd
    ? [TIMELOCK, "0x14c7dd468a86c4bd722927a815e923e60565c1b2"]
    : [TIMELOCK, "0x14c7dd468a86c4bd722927a815e923e60565c1b2"];

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

    timelock: new TenantContract<IGovernorContract>({
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
  };
};
