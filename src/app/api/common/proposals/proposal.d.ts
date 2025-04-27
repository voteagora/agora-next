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

/*
export type OptimismProposals = {
  proposal_id: string
  contract: string
  
  proposer: string
  description: string | null
  
  ordinal: Prisma.Decimal
  created_block: bigint | null
  start_block: string
  end_block: string | null
  cancelled_block: bigint | null
  queued_block: bigint | null
  executed_block: bigint | null
  
  proposal_data: Prisma.JsonValue | null
  proposal_data_raw: string | null
  proposal_type: $Enums.ProposalType
  proposal_type_data: Prisma.JsonValue | null
  proposal_results: Prisma.JsonValue | null

  created_transaction_hash: string | null
  cancelled_transaction_hash: string | null
  queued_transaction_hash: string | null
  executed_transaction_hash: string | null
}
*/

export type ProposalPayloadFromDAONode = {
  id: string;

  proposer: string;
  description: string;

  block_number: number;
  transaction_index: number;
  log_index: number;

  targets: string[];
  values: number[];
  signatures: string[];
  calldatas: string[];
  start_block: number;
  end_block: number;

  queue_event?: {
    block_number: number;
    transaction_index: number;
    log_index: number;
    id: string;
    eta: number;
  };

  execute_event?: {
    block_number: number;
    transaction_index: number;
    log_index: number;
    id: string;
  };

  cancel_event?: {
    block_number: number;
    transaction_index: number;
    log_index: number;
    id: string;
  };

  totals: Record<string, string>;
  voting_module_name: string;
}


export type ProposalPayloadFromDB = {
  proposal_id: string;

  proposer: string;
  description: string | null;
  
  created_block: bigint | null;
  start_block: string;
  end_block: string | null;
  cancelled_block: bigint | null;
  executed_block: bigint | null;
  queued_block: bigint | null;

  proposal_data:  Prisma.JsonValue | null;
  proposal_results: Prisma.JsonValue | null;
  proposal_type: ProposalType;
  proposal_type_data:  Prisma.JsonValue | null;
};

export type ProposalPayload = ProposalPayloadFromDB | lineaProposals;

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
