import { OptimismVotes, LineaVotes } from "@prisma/client";
import { ParsedParams } from "@/lib/voteUtils";
import { ProposalType } from "@/lib/types";

export type VotesSortOrder = "asc" | "desc";
export type VotesSort = "weight" | "block_number";

export type VotePayload = OptimismVotes | LineaVotes;

export type Vote = {
  transactionHash: string | null;
  address: string;
  proposalId: string;
  support: Support;
  weight: string;
  reason: string | null;
  params: ParsedParams[ProposalType]["kind"];
  proposalValue: bigint;
  proposalTitle: string;
  proposalType: ProposalType;
  timestamp: Date | null;
  blockNumber?: bigint;
  transaction_index?: number;
  citizenType: string | null;
};

export type SnapshotVotePayload = {
  id: string;
  voter: string;
  created: BigInt;
  choice: string;
  metadata?: Record<string, any>;
  reason?: string;
  app?: string;
  vp: number;
  vp_by_strategy?: Record<string, any>;
  vp_state?: string;
  proposal_id?: string;
  choice_labels?: Record<string, any>;
  dao_slug?: string;
  title?: string;
};

export type SnapshotVote = {
  id: string;
  address: string;
  createdAt: Date;
  choice: string;
  votingPower: number;
  title: string;
  reason: string;
  choiceLabels: Record<string, any>;
};

export type DaoNodeDelegateVote = {
  bn: string; // block number
  tid: number; // transaction index
  voter: string;
  proposal_id: string;
  support: number;
  weight: number;
  reason?: string;
  params?: number[];
};

export type DaoNodeVoteRecord = {
  bn: string; // block number
  tid: number; // transaction index
  lid: number; // event log index
  voter: string;
  support: number;
  weight?: number; // Depending on the ABI, "weight" or "votes" will be present
  votes?: number;
  reason?: string;
  params?: number[];
};

export type DelegatesSort =
  | "most_delegators"
  | "weighted_random"
  | "voting_power"
  | "least_voting_power"
  | "most_recent_delegation"
  | "oldest_delegation"
  | "latest_voting_block"
  | "vp_change_7d"
  | "vp_change_7d_desc";
