import {
  arbitrum,
  base,
  mainnet,
  optimism,
  scroll,
  sepolia,
} from "viem/chains";

export function normalizeExplorerNetwork(network: string): string {
  const n = network.trim().toLowerCase();
  const aliases: Record<string, string> = {
    mainnet: mainnet.name.toLowerCase(),
    homestead: mainnet.name.toLowerCase(),
    eth: mainnet.name.toLowerCase(),
    optimism: optimism.name.toLowerCase(),
    op: optimism.name.toLowerCase(),
    arbitrum: arbitrum.name.toLowerCase(),
    arb: arbitrum.name.toLowerCase(),
    base: base.name.toLowerCase(),
    scroll: scroll.name.toLowerCase(),
    sepolia: sepolia.name.toLowerCase(),
  };
  return aliases[n] ?? n;
}
