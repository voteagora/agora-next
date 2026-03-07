export type MiradorChainName =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "base"
  | "optimism"
  | "bsc";

export type MiradorTraceSource = "frontend" | "backend" | "api";

export type ProposalCreationBranch =
  | "safe_offchain_draft"
  | "safe_direct_onchain";

export type MiradorTraceContext = {
  traceId?: string | null;
  flow?: string;
  step?: string;
  source?: MiradorTraceSource;
  walletAddress?: string;
  chainId?: number | string;
  branch?: ProposalCreationBranch;
  sessionId?: string;
};

export type MiradorAttributeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

export type MiradorAttributeMap = Record<string, MiradorAttributeValue>;

export type ProposalCreationTraceState = {
  traceId: string;
  flow: typeof import("./constants").MIRADOR_FLOW.proposalCreation;
  branch?: ProposalCreationBranch;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
  safeAddress?: `0x${string}`;
  startedAt: number;
};
