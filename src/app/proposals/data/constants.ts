/**
 * Hardcoded fallback data for archived proposals
 * Used when data is missing from JSON files
 */

export const PROPOSAL_DEFAULTS = {
  // Default quorum values by namespace
  quorum: {
    cyber: "1000000000000000000000", // 1000 tokens
    pguild: "1000000000000000000000",
    optimism: "30000000000000000000000000", // 30M tokens
  },

  // Default votable supply by namespace
  votableSupply: {
    cyber: "100000000000000000000000000", // 100M tokens
    pguild: "100000000000000000000000000",
    optimism: "1000000000000000000000000000", // 1B tokens
  },

  // Default approval threshold (in basis points, e.g., 5100 = 51%)
  approvalThreshold: "5100",

  // Default proposal type metadata
  proposalTypeMetadata: {
    standard: {
      name: "Standard",
      description: "Standard proposal type",
      quorum: "0",
      approval_threshold: "0",
      proposal_type_id: "0",
    },
    governance: {
      name: "Governance",
      description: "Governance proposal type",
      quorum: "0",
      approval_threshold: "5100", // 51%
      proposal_type_id: "3",
    },
    optimistic: {
      name: "Optimistic",
      description: "Optimistic proposal type",
      quorum: "0",
      approval_threshold: "0",
      proposal_type_id: "2",
    },
    approval: {
      name: "Approval",
      description: "Approval voting proposal type",
      quorum: "0",
      approval_threshold: "0",
      proposal_type_id: "3",
    },
  },

  // Default description when missing
  description: "# Proposal\n\nNo description available.",

  // Default title when missing
  title: "Untitled Proposal",
};

/**
 * Status badges for archived proposals
 */
export const PROPOSAL_STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "positive",
  },
  succeeded: {
    label: "Succeeded",
    color: "positive",
  },
  defeated: {
    label: "Defeated",
    color: "negative",
  },
  executed: {
    label: "Executed",
    color: "positive",
  },
  queued: {
    label: "Queued",
    color: "tertiary",
  },
  cancelled: {
    label: "Cancelled",
    color: "secondary",
  },
  expired: {
    label: "Expired",
    color: "secondary",
  },
  pending: {
    label: "Pending",
    color: "tertiary",
  },
};
