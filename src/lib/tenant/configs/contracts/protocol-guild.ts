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

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const protocolGuildTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x95fc87e77977a70b08c76b0a7714069d8ff0ff2b"
    : "0x380afD534539ad1C43c3268E7Cb71BAa766aE6f9";

  const GOVERNOR = isProd
    ? "0x42baa004ff081ba7e3b2b810e7a9b4e0e35e8b01"
    : "0x8fFF4C5ABcb31fAc43DcE92f77920F3cB9854fB8";

  const TIMELOCK = isProd
    ? "0x0cabe65b0adc1634f56ea66a36abb70f2d4232c5"
    : "0xeba09e62142052831fe0ccdd73476ca5ce84b2f1";

  const TYPES = isProd
    ? "0xa78db4a8efccd5812e0044496edcc571da3d24c6"
    : "0x966daa9da3c7ef86c0f9fd678bd5d8cb1b856577";

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
  };
};
