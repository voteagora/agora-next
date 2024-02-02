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
