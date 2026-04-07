export type MiradorChainName =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "base"
  | "optimism"
  | "bsc";

export type MiradorTraceSource = "frontend" | "backend" | "api";
export type MiradorFlow =
  (typeof import("./constants").MIRADOR_FLOW)[keyof typeof import("./constants").MIRADOR_FLOW];

export type ProposalCreationBranch =
  | "safe_offchain_draft"
  | "safe_direct_onchain"
  | "draft_onchain_publish";

export type MiradorTraceContext = {
  traceId?: string | null;
  flow?: MiradorFlow;
  step?: string;
  source?: MiradorTraceSource;
  walletAddress?: string;
  chainId?: number | string;
  proposalId?: string;
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
