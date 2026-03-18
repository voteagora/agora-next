import { TenantContracts } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { defineChain } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";
import { ERC20__factory } from "@/lib/contracts/generated";

const SHAPE_MAINNET_RPC = "https://mainnet.shape.network";
const SHAPE_SEPOLIA_RPC = "https://sepolia.shape.network";

export const shapeMainnet = defineChain({
  id: 360,
  name: "Shape",
  network: "shape",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: [SHAPE_MAINNET_RPC] },
    public: { http: [SHAPE_MAINNET_RPC] },
  },
  blockExplorers: {
    default: { name: "Shapescan", url: "https://shapescan.xyz" },
  },
});

export const shapeSepolia = defineChain({
  id: 11011,
  name: "Shape Sepolia",
  network: "shape-sepolia",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: [SHAPE_SEPOLIA_RPC] },
    public: { http: [SHAPE_SEPOLIA_RPC] },
  },
  blockExplorers: {
    default: { name: "Shapescan", url: "https://sepolia.shapescan.xyz" },
  },
  testnet: true,
});

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const shapeTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x360aAC543A23dbcefA8049d4C4d8B18dA1CCa360" // Shape mainnet (prod)
    : "0x4200000000000000000000000000000000000042"; // GovernanceToken on Shape Sepolia

  // dummy addresses; info-only (no-gov) like towns
  const DUMMY_GOVERNOR = "0x0000000000000000000000000000000000000002";
  const DUMMY_TIMELOCK = "0x0000000000000000000000000000000000000003";
  const DUMMY_TYPES = "0x0000000000000000000000000000000000000004";

  const rpcUrl =
    process.env.NEXT_PUBLIC_FORK_NODE_URL ??
    (isProd ? SHAPE_MAINNET_RPC : SHAPE_SEPOLIA_RPC);
  const provider = new JsonRpcProvider(rpcUrl);
  const chain = isProd ? shapeMainnet : shapeSepolia;

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
      abi: [],
      address: DUMMY_GOVERNOR,
      chain,
      contract: {} as IGovernorContract,
      provider,
    }),

    timelock: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TIMELOCK,
      chain,
      contract: {} as BaseContract,
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: [],
      address: DUMMY_TYPES,
      chain,
      contract: {} as BaseContract,
      provider,
    }),

    treasury: [],
  };
};
