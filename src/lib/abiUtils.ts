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
import { normalizeExplorerNetwork } from "./explorerNetwork";
import Tenant from "./tenant/tenant";

const ETHERSCAN_V2_API = "https://api.etherscan.io/v2/api";

const LEGACY_EXPLORER_API: Record<string, string> = {
  derive: "https://explorer.derive.xyz/api",
  cyber: "https://api.socialscan.io/cyber",
};

const CHAIN_ID: Record<string, number> = {
  [mainnet.name.toLowerCase()]: mainnet.id,
  mainnet: mainnet.id,
  ethereum: mainnet.id,
  homestead: mainnet.id,
  eth: mainnet.id,
  [sepolia.name.toLowerCase()]: sepolia.id,
  sepolia: sepolia.id,
  [optimism.name.toLowerCase()]: optimism.id,
  optimism: optimism.id,
  op: optimism.id,
  [optimismSepolia.name.toLowerCase()]: optimismSepolia.id,
  [arbitrum.name.toLowerCase()]: arbitrum.id,
  arbitrum: arbitrum.id,
  arb: arbitrum.id,
  [arbitrumSepolia.name.toLowerCase()]: arbitrumSepolia.id,
  [base.name.toLowerCase()]: base.id,
  base: base.id,
  [scroll.name.toLowerCase()]: scroll.id,
  scroll: scroll.id,
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
  domain: string | undefined;
  chainId: number | null;
  canonicalNetwork: string;
  useEtherscanV2: boolean;
} {
  const canonicalNetwork = normalizeExplorerNetwork(networkName);
  const chainId = CHAIN_ID[canonicalNetwork] ?? null;
  const legacy = LEGACY_EXPLORER_API[canonicalNetwork];
  if (legacy) {
    return {
      domain: legacy,
      chainId,
      canonicalNetwork,
      useEtherscanV2: false,
    };
  }
  if (chainId != null) {
    return {
      domain: ETHERSCAN_V2_API,
      chainId,
      canonicalNetwork,
      useEtherscanV2: true,
    };
  }
  return {
    domain: undefined,
    chainId: null,
    canonicalNetwork,
    useEtherscanV2: false,
  };
}

const { contracts } = Tenant.current();

const fallbackGetContractAbi = async (
  contractAddress: string
): Promise<AbiItem[] | null> => {
  try {
    const fallbackUrl = `${process.env.STORAGE_BUCKET_URL}${contracts.governor.chain.id}/${contractAddress.toLowerCase()}.json`;
    const fallbackResponse = await axios.get(fallbackUrl);
    const fallbackData = fallbackResponse.data;
    if (fallbackResponse.status === 200) {
      return fallbackData;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

async function getContractAbi(
  contractAddress: string,
  etherscanApiKey: string,
  network: string = mainnet.name.toLowerCase()
): Promise<AbiItem[] | null> {
  const { domain, chainId, canonicalNetwork, useEtherscanV2 } =
    getExplorerDomain(network);
  if (!domain) {
    console.warn("[getContractAbi] No explorer URL for network", {
      network,
      canonicalNetwork,
      contractAddress,
    });
    return await fallbackGetContractAbi(contractAddress);
  }
  if (useEtherscanV2 && chainId == null) {
    console.warn("[getContractAbi] Etherscan V2 requires chainId", {
      network,
      canonicalNetwork,
      contractAddress,
    });
    return await fallbackGetContractAbi(contractAddress);
  }

  const qs = new URLSearchParams({
    module: "contract",
    action: "getabi",
    address: contractAddress,
    apikey: etherscanApiKey,
  });
  if (useEtherscanV2) {
    qs.set("chainid", String(chainId));
  } else if (chainId != null && chainId !== mainnet.id) {
    qs.set("chainid", String(chainId));
  }
  const sep = domain.includes("?") ? "&" : "?";
  const url = `${domain}${sep}${qs.toString()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": etherscanApiKey,
      },
    });
    if (response.data.status === "1") {
      return JSON.parse(response.data.result);
    }
    console.warn("[getContractAbi] Explorer getabi non-success", {
      network,
      canonicalNetwork,
      chainId,
      contractAddress,
      message:
        typeof response.data?.result === "string"
          ? response.data.result.slice(0, 240)
          : response.data?.message,
    });
    return await fallbackGetContractAbi(contractAddress);
  } catch (error) {
    console.warn("[getContractAbi] Request failed", {
      network,
      canonicalNetwork,
      chainId,
      contractAddress,
      error: error instanceof Error ? error.message : String(error),
    });
    return await fallbackGetContractAbi(contractAddress);
  }
}

export const cachedGetContractAbi = unstable_cache(
  getContractAbi,
  ["contract-abi", "etherscan-v2"],
  {
    revalidate: 86400,
  }
);
