"use server";

import {
  mainnet,
  sepolia,
  optimism,
  arbitrum,
  arbitrumSepolia,
  optimismSepolia,
  base,
  scroll,
} from "viem/chains";
import axios from "axios";
import { unstable_cache } from "next/cache";

const EXPLORER_DOMAINS = {
  [mainnet.name.toLowerCase()]: "https://api.etherscan.io/api",
  [sepolia.name.toLowerCase()]: "https://api-sepolia.etherscan.io/api",
  [optimism.name.toLowerCase()]: "https://api-optimistic.etherscan.io/api",
  [arbitrum.name.toLowerCase()]: "https://api.arbiscan.io/api",
  [arbitrumSepolia.name.toLowerCase()]: "https://api-sepolia.arbiscan.io/api",
  [optimismSepolia.name.toLowerCase()]: "https://api-sepolia.optimism.io/api",
  [base.name.toLowerCase()]: "https://api.basescan.org/api",
  [scroll.name.toLowerCase()]: "https://api.scrollscan.com/api",
  derive: "https://explorer.derive.xyz/api",
  cyber: "https://api.socialscan.io/cyber",
};

interface AbiItem {
  type: string;
  name?: string;
  inputs?: Array<{
    name: string;
    type: string;
    indexed?: boolean;
    internalType?: string;
    components?: any[];
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
    components?: any[];
  }>;
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
}

function getExplorerDomain(networkName: string): string {
  return (
    EXPLORER_DOMAINS[
      networkName.toLowerCase() as keyof typeof EXPLORER_DOMAINS
    ] || "https://api.etherscan.io/api"
  );
}

async function getContractAbi(
  contractAddress: string,
  etherscanApiKey: string,
  network: string = "mainnet"
): Promise<AbiItem[] | null> {
  const domain = getExplorerDomain(network);
  const url = `${domain}?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": etherscanApiKey,
      },
    });
    if (response.data.status === "1") {
      return JSON.parse(response.data.result);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export const cachedGetContractAbi = unstable_cache(
  getContractAbi,
  ["contract-abi"],
  {
    revalidate: 86400,
  }
);
