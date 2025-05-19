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
import Tenant from "./tenant/tenant";

const EXPLORER_DOMAINS = {
  [mainnet.name.toLowerCase()]: "https://api.etherscan.io/api",
  derive: "https://explorer.derive.xyz/api",
  cyber: "https://api.socialscan.io/cyber",
};

const CHAIN_ID = {
  [mainnet.name.toLowerCase()]: 1,
  [sepolia.name.toLowerCase()]: 11155111,
  [optimism.name.toLowerCase()]: 10,
  [optimismSepolia.name.toLowerCase()]: 11155420,
  [arbitrum.name.toLowerCase()]: 42161,
  [arbitrumSepolia.name.toLowerCase()]: 421614,
  [base.name.toLowerCase()]: 8453,
  [scroll.name.toLowerCase()]: 534352,
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

function getExplorerDomain(networkName: string): {
  domain: string;
  chainId: number | null;
} {
  const chainId =
    CHAIN_ID[networkName.toLowerCase() as keyof typeof CHAIN_ID] || null;
  const domain =
    EXPLORER_DOMAINS[
      networkName.toLowerCase() as keyof typeof EXPLORER_DOMAINS
    ];
  return {
    domain,
    chainId,
  };
}

const { contracts } = Tenant.current();

const fallbackGetContractAbi = async (
  contractAddress: string
): Promise<AbiItem[] | null> => {
  const fallbackUrl = `${process.env.STORAGE_BUCKET_URL}${contracts.governor.chain.id}/${contractAddress}.json`;
  const fallbackResponse = await axios.get(fallbackUrl);
  const fallbackData = fallbackResponse.data;
  if (fallbackResponse.status === 200) {
    return fallbackData;
  } else {
    return null;
  }
};

async function getContractAbi(
  contractAddress: string,
  etherscanApiKey: string,
  network: string = "mainnet"
): Promise<AbiItem[] | null> {
  const { domain, chainId } = getExplorerDomain(network);
  const url = `${domain}${chainId ? `?chainid=${chainId}&` : "?"}module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": etherscanApiKey,
      },
    });
    if (response.data.status === "1") {
      return JSON.parse(response.data.result);
    } else {
      return await fallbackGetContractAbi(contractAddress);
    }
  } catch (error) {
    return await fallbackGetContractAbi(contractAddress);
  }
}

export const cachedGetContractAbi = unstable_cache(
  getContractAbi,
  ["contract-abi"],
  {
    revalidate: 86400,
  }
);
