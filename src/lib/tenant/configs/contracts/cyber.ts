import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";

import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { JsonRpcProvider } from "ethers";
import { defineChain } from "viem";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const cyber = defineChain({
  id: 7560,
  name: "Cyber",
  network: "cyber",
  nativeCurrency: { name: "Cyber", symbol: "CYBER", decimals: 18 },
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
      blockCreated: 14,
    },
  },
  testnet: false,
});

export const cyberTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd ? " " : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";
  const GOVERNOR = isProd
    ? "0x176A107b77B09973d9fBE6AE2643D0bB6c4B3A7D"
    : "0x741005a136766e6e03ed8a7cc32d6a91241e5bf5";

  const provider = new JsonRpcProvider(
    isProd
      ? "https://cyber.alt.technology"
      : "https://cyber-testnet.alt.technology/"
  );
  const chain = cyber;

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: EtherfiToken__factory.connect(TOKEN, provider),
      provider,
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
