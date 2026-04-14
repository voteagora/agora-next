import {
  arbitrum,
  base,
  bsc,
  goerli,
  linea,
  lineaSepolia,
  mainnet,
  optimism,
  polygon,
  scroll,
  sepolia,
} from "viem/chains";

export const UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE =
  "Safe proposal flows are not supported on this chain yet.";

type SafeChainCapability = {
  safeAppChainSegment?: string;
  txServiceChainName?: string;
  legacyTxServiceNetworkName?: string;
};

const SAFE_CHAIN_CAPABILITIES: Record<number, SafeChainCapability> = {
  [mainnet.id]: {
    safeAppChainSegment: "eth",
    txServiceChainName: "eth",
    legacyTxServiceNetworkName: "mainnet",
  },
  [optimism.id]: {
    safeAppChainSegment: "oeth",
    txServiceChainName: "oeth",
    legacyTxServiceNetworkName: "optimism",
  },
  [polygon.id]: {
    safeAppChainSegment: "matic",
    txServiceChainName: "matic",
    legacyTxServiceNetworkName: "polygon",
  },
  [base.id]: {
    safeAppChainSegment: "base",
    txServiceChainName: "base",
    legacyTxServiceNetworkName: "base",
  },
  [arbitrum.id]: {
    safeAppChainSegment: "arb1",
    txServiceChainName: "arb1",
    legacyTxServiceNetworkName: "arbitrum",
  },
  [sepolia.id]: {
    safeAppChainSegment: "sep",
    txServiceChainName: "sep",
    legacyTxServiceNetworkName: "sepolia",
  },
  [scroll.id]: {
    safeAppChainSegment: "scr",
    txServiceChainName: "scr",
    legacyTxServiceNetworkName: "scroll",
  },
  [linea.id]: {
    safeAppChainSegment: "linea",
    txServiceChainName: "linea",
  },
  [bsc.id]: {
    safeAppChainSegment: "bnb",
    txServiceChainName: "bnb",
  },
  [goerli.id]: {
    legacyTxServiceNetworkName: "goerli",
  },
  [lineaSepolia.id]: {},
};

export function getSafeAppChainSegment(chainId: number) {
  return SAFE_CHAIN_CAPABILITIES[chainId]?.safeAppChainSegment ?? null;
}

export function getSafeTxServiceBaseUrls(chainId: number) {
  const capability = SAFE_CHAIN_CAPABILITIES[chainId];
  if (!capability) {
    return [];
  }

  const baseUrls: string[] = [];
  if (capability.legacyTxServiceNetworkName) {
    baseUrls.push(
      `https://safe-transaction-${capability.legacyTxServiceNetworkName}.safe.global/api/v1`
    );
  }

  if (capability.txServiceChainName) {
    baseUrls.push(
      `https://api.safe.global/tx-service/${capability.txServiceChainName}/api/v1`
    );
  }

  return Array.from(new Set(baseUrls));
}

export function isSafeProposalFlowSupported(chainId: number) {
  return getSafeTxServiceBaseUrls(chainId).length > 0;
}

export function assertSafeProposalFlowSupported(chainId: number) {
  if (isSafeProposalFlowSupported(chainId)) {
    return;
  }

  throw new Error(UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE);
}
