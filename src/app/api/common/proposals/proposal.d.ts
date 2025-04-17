import {
  ParsedProposalData,
  ProposalStatus,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import {
  OptimismProposals,
  ProposalType,
  lineaProposals,
} from "@prisma/client";
import { BigNumberish } from "ethers";
import { Decimal } from "@prisma/client/runtime";

export type ProposalPayload = OptimismProposals | lineaProposals;

// Interface for proposals with start_timestamp
export interface TimestampBasedProposal {
  start_timestamp: string;
  end_timestamp: string;
  start_block?: never;
  end_block?: never;
}

// Interface for proposals with start_block
export interface BlockBasedProposal {
  start_block: string;
  end_block: string | null;
  start_timestamp?: never;
  end_timestamp?: never;
}

// Complete Proposal type with all additional properties
export type Proposal = {
  id: string;
  proposer: string;
  snapshotBlockNumber: number;
  createdTime: Date | null;
  startTime: Date | null;
  startBlock: bigint | string | null;
  endTime: Date | null;
  endBlock: bigint | string | null;
  cancelledTime: Date | null;
  executedTime: Date | null;
  executedBlock: bigint | string | null;
  queuedTime: Date | null;
  markdowntitle: string;
  description: string | null;
  quorum: bigint | null;
  approvalThreshold: bigint | null;
  proposalData: ParsedProposalData[ProposalType]["kind"];
  unformattedProposalData: `0x${string}` | null | any;
  proposalResults: ParsedProposalResults[ProposalType]["kind"];
  proposalType: ProposalType | null;
  status: ProposalStatus | null;
  createdTransactionHash: string | null;
  cancelledTransactionHash: string | null;
  executedTransactionHash: string | null;
};
