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
  endTime: Date | null;
  cancelledTime: Date | null;
  executedTime: Date | null;
  markdowntitle: string;
  description: string | null;
  quorum: BigNumberish | null;
  approvalThreshold: BigNumberish | null;
  proposalData: ParsedProposalData[ProposalType]["kind"];
  unformattedProposalData: `0x${string}` | null | any;
  proposalResults: ParsedProposalResults[ProposalType]["kind"];
  proposalType: ProposalType | null;
  status: ProposalStatus | null;
  createdTransactionHash: string | null;
  cancelledTransactionHash: string | null;
  executedTransactionHash: string | null;
};
