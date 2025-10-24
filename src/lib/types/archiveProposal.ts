/**
 * Type definitions for archive proposals from NDJSON format
 */

export type ArchiveProposalEvent = {
  block_number?: string;
  transaction_index?: number;
  log_index?: number;
  id?: string;
  timestamp?: number;
  blocktime?: number;
  eta?: number;
  transaction_hash?: string;
};

// Proposal type with fixed configuration (eas-oodao)
export type FixedProposalType = {
  name: string;
  class: "STANDARD" | "OPTIMISTIC" | "APPROVAL";
  quorum: number; // basis points (e.g., 3520 = 35.2%)
  description: string;
  approval_threshold: number; // basis points (e.g., 10000 = 100%)
};

// Proposal type with range configuration (eas-oodao)
export type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

export type ArchiveListProposal = {
  // Common fields
  id: string;
  title: string;
  proposer: string;
  proposer_ens: string | null | { detail?: string };
  start_blocktime: number;
  end_blocktime: number;
  start_block: number;
  end_block: number;
  data_eng_properties: {
    liveness: "live" | "archived";
    source: "dao_node" | "eas-oodao" | string;
  };

  // Vote data - different keys for different sources
  totals?: {
    [key: string]: {
      "0"?: string; // against votes
      "1"?: string; // for votes
      "2"?: string; // abstain votes
    };
  };
  outcome?: {
    [key: string]: {
      "0"?: string; // against votes
      "1"?: string; // for votes
      "2"?: string; // abstain votes
    };
  };

  // Proposal type - different formats for different sources
  proposal_type: number | FixedProposalType | RangeProposalType;

  // dao_node specific fields
  block_number?: string;
  transaction_index?: number;
  log_index?: number;
  targets?: string[];
  values?: number[];
  signatures?: string[];
  calldatas?: string[];
  description?: string;
  voting_module_name?: string;
  decoded_proposal_data?: {
    functionArgsName?: {
      functionName: string;
      functionArgs: string[];
    }[];
  };
  proposal_data?: string;
  quorum?: string | number;
  quorumVotes?: string | number;
  votableSupply?: string | number;
  votable_supply?: string | number;
  approval_threshold?: string | number;
  blocktime?: number;
  created_event?: ArchiveProposalEvent;
  queue_event?: ArchiveProposalEvent;
  execute_event?: ArchiveProposalEvent;
  cancel_event?: ArchiveProposalEvent;

  // eas-oodao specific fields
  transaction_hash?: string;
  dao_id?: string;
  uid?: string;
  chain_id?: number;
  tags?: string[];
  total_voting_power_at_start?: string;
};
