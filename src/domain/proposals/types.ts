import { Address } from "viem";

export type ProposalType =
  | "STANDARD"
  | "APPROVAL"
  | "OPTIMISTIC"
  | "SNAPSHOT"
  | "OFFCHAIN_OPTIMISTIC_TIERED"
  | "OFFCHAIN_OPTIMISTIC"
  | "OFFCHAIN_STANDARD"
  | "OFFCHAIN_APPROVAL"
  | "HYBRID_STANDARD"
  | "HYBRID_APPROVAL"
  | "HYBRID_OPTIMISTIC"
  | "HYBRID_OPTIMISTIC_TIERED";

export enum ProposalStatus {
  ADDING_TEMP_CHECK = "ADDING_TEMP_CHECK",
  DRAFTING = "DRAFTING",
  ADDING_GITHUB_PR = "ADDING_GITHUB_PR",
  AWAITING_SUBMISSION = "AWAITING_SUBMISSION",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUCCEEDED = "SUCCEEDED",
  DEFEATED = "DEFEATED",
  QUEUED = "QUEUED",
  EXECUTED = "EXECUTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface ProposalData {
  type: ProposalType;
}

export interface StandardProposalData extends ProposalData {
  type: "STANDARD";
  targets: Address[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
}

export interface ApprovalProposalData extends ProposalData {
  type: "APPROVAL";
  options: ApprovalOption[];
  maxApprovals: number;
  criteria: "THRESHOLD" | "TOP_CHOICES";
  criteriaValue: number;
  budgetToken?: Address;
  budgetAmount?: bigint;
}

export interface ApprovalOption {
  title: string;
  transactions: Transaction[];
  votes?: bigint;
}

export interface Transaction {
  type: "TRANSFER" | "CUSTOM";
  target: Address;
  value: bigint;
  calldata: string;
  signature?: string;
  token?: Address;
  recipient?: Address;
  amount?: bigint;
}

export interface ProposalResults {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalVotes?: bigint;
}

export interface ProposalMetrics {
  quorumMet: boolean;
  approvalMet: boolean;
  participationRate: number;
  approvalRate: number;
}

export interface ProposalTimeline {
  createdBlock: bigint;
  startBlock: bigint;
  endBlock: bigint;
  queuedBlock?: bigint;
  executedBlock?: bigint;
  cancelledBlock?: bigint;
}

export interface SearchCriteria {
  type?: ProposalType;
  status?: ProposalStatus;
  proposer?: Address;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "startBlock" | "endBlock";
  orderDirection?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
