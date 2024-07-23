import { OptimismVotes } from "@prisma/client";

export type VotesSortOrder = "asc" | "desc";
export type VotesSort = "weight" | "block_number";

export type VotePayload = OptimismVotes;

export type Vote = {
  transactionHash: string;
  address: string;
  proposal_id: string;
  support: Support;
  weight: string;
  reason: string | null;
  params: ParsedParams[ProposalType]["kind"];
  proposalValue: bigint;
  proposalTitle: string;
  proposalType: ProposalType;
  timestamp: Date | null;
};

export type SnapshotVote = {
  id: string;
  voter?: string;
  created?: number;
  choice?: string;
  metadata?: Record<string, any>;
  reason?: string;
  app?: string;
  vp?: number;
  vp_by_strategy?: Record<string, any>;
  vp_state?: string;
  proposal_id?: string;
  choice_labels?: Record<string, any>;
  dao_slug?: string;
};
