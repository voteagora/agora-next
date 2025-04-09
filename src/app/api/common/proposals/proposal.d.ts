import {
  ParsedProposalData,
  ProposalStatus,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import { OptimismProposals, ProposalType } from "@prisma/client";
import { BigNumberish } from "ethers";

export type ProposalPayload = OptimismProposals;

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
