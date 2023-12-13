import {
  ParsedProposalData,
  ProposalStatus,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import { ProposalType } from "@prisma/client";
import { BigNumberish } from "ethers";

export type Proposal = {
  id: string;
  proposer: string;
  snapshotBlockNumber: number;
  created_time: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  markdowntitle: string;
  description: string | null;
  quorum: BigNumberish | null;
  approvalThreshold: BigNumberish | null;
  proposalData: ParsedProposalData[ProposalType]["kind"];
  proposalResults: ParsedProposalResults[ProposalType]["kind"];
  proposalType: ProposalType | null;
  status: ProposalStatus | null;
};
