import {
  ParsedProposalData,
  ProposalStatus,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import { OptimismProposals, lineaProposals } from "@prisma/client";
import { BigNumberish } from "ethers";
import { Decimal } from "@prisma/client/runtime";
import { ProposalType } from "@/lib/types";

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
  proposal_type: number;
  voting_module_name: string;

  // this is a string representing bytes, without 0x prefix.
  // It's the old proposal_data_raw -- Jeff M, 2025-04-29
  proposal_data: string | null;

  // this is the abi decode version of proposal_data,
  // cast to integers and strings.
  // The old DB proposal_data field overloaded and conflated proposal_data
  // with transaction header information (Eg. targets, values, signatures, calldatas)
  // for standard votes (only).
  // We're not going to do that in DAO Node, instead we're going to correct it throughout
  // agora-next to use the correct treatment.
  // The one issue that isn't fully resolved is during the decoding,
  // some large numbers get corrupted by Typescript's JSON treatment.
  // So, DAO Node might be forced to re-cast large integers as strings, where they exist.
  // We'll make this decision later, after tests are up and running. -- Jeff M, 2025-04-29
  decoded_proposal_data?: Object;
};

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

  proposal_data: Prisma.JsonValue | null;
  proposal_results: Prisma.JsonValue | null;
  proposal_type: ProposalType;
  proposal_type_data: Prisma.JsonValue | null;
  proposal_data_raw: string | null;

  created_transaction_hash: string | null;
  cancelled_transaction_hash: string | null;
  queued_transaction_hash: string | null;
  executed_transaction_hash: string | null;
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
export type ProposalTypeData = {
  proposal_type_id: number;
  name: string;
  quorum: bigint;
  approval_threshold: bigint;
};

export type Proposal = {
  archiveMetadata?: any;
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
  votableSupply?: bigint | null; // Added votableSupply property to match Python implementation
  approvalThreshold: bigint | null;
  proposalData: ParsedProposalData[ProposalType]["kind"];
  unformattedProposalData: `0x${string}` | null | any;
  proposalResults: ParsedProposalResults[ProposalType]["kind"];
  proposalType: ProposalType | null;
  proposalTypeData: ProposalTypeData | null;
  status: ProposalStatus | null;
  createdTransactionHash: string | null;
  cancelledTransactionHash: string | null;
  executedTransactionHash: string | null;
  offchainProposalId?: string;
  kwargs?: Record<string, any>;
  taxFormMetadata?: Record<string, unknown>;
};
