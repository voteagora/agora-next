import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  CyberProposalTypes__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { defineChain } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  PROPOSAL_TYPES_CONFIGURATOR_FACTORY,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const cyber = /*#__PURE__*/ defineChain({
  id: 7560,
  name: "Cyber",
  network: "cyber",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.cyber.co"],
      webSocket: ["wss://rpc.cyber.co"],
    },
    public: {
      http: ["https://cyber.alt.technology"],
      webSocket: ["wss://cyber-ws.alt.technology"],
    },
  },
  blockExplorers: {
    default: {
      name: "Cyberscan",
      url: "https://cyberscan.co",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0,
    },
  },
  testnet: false,
});

export const cyberTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x522d3a9c2bc14ce1c4d210ed41ab239fded02f2b"
    : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";

  const GOVERNOR = isProd
    ? "0x58E53131c339aA3cBA35904538eA5948f751050a"
    : "0x963f3645ff2dB82f607fcf5b70c8bB133D53bD36";

  const TREASURY = isProd
    ? ["0x23f4F627EC82001c422658d87BA65C2D4AdDa794"]
    : ["0xEb3aef5D867109E734fB08E7b1f7b7bba8226aa3"];

  const TYPES = isProd
    ? "0x36a8529335AdBE769Dd9180C275e9b8eCD3C6C72"
    : "0x0B629B2ff953a9f0216816342685514798E18819";

  const TIMELOCK = isProd
    ? "0x11caA7DF2a1FCAea7149fc01aC8D2DB5d3C82421"
    : "0xa9E1A6856bcd9e8b3c4B336f229061c1C5461Bc6";

  const APPROVAL_MODULE = isProd
    ? "0x751a4989E01776522B6989511D0B969311Dd5f4e"
    : "0x096F1e0e82CaD5540BF04bd95A6802C0350d8E49";

  //     // main - 0x751a4989E01776522B6989511D0B969311Dd5f4e
  // // testnet - 0x096F1e0e82CaD5540BF04bd95A6802C0350d8E49
  //     export const cyberApprovalModuleAddress =
  //       "0x096F1e0e82CaD5540BF04bd95A6802C0350d8E49" as `0x${string}`;

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : new JsonRpcProvider("https://cyber.alt.technology");

  const chain = cyber;

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
      abi: CyberProposalTypes__factory.abi,
      address: TYPES,
      chain,
      contract: CyberProposalTypes__factory.connect(TYPES, provider),
      provider,
    }),

    treasury: TREASURY,
    governorApprovalModule: APPROVAL_MODULE,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    proposalTypesConfiguratorFactory:
      PROPOSAL_TYPES_CONFIGURATOR_FACTORY.WITHOUT_DESCRIPTION,
  };
};
