import { OptimismVotes } from "@prisma/client";
import { ParsedParams } from "@/lib/voteUtils";
import { ProposalType } from "@prisma/client";

export type VotesSortOrder = "asc" | "desc";
export type VotesSort = "weight" | "block_number";

export type VotePayload = OptimismVotes;

export type Vote = {
  transactionHash: string;
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
