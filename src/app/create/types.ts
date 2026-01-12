export type PostType = "tempcheck" | "gov-proposal";

export const postTypeOptions = {
  tempcheck: "Temp check",
  "gov-proposal": "Governance proposal",
} as const;

// EAS Voting Types
export type EASVotingType = "standard" | "approval" | "optimistic";

export const easVotingTypeOptions: Record<EASVotingType, string> = {
  standard: "Standard",
  approval: "Approval",
  optimistic: "Optimistic",
} as const;

// Metadata for each voting type (similar to DraftFormClient pattern)
export const EASVotingTypeMetadata: Record<
  EASVotingType,
  { title: string; description: string }
> = {
  standard: {
    title: "Standard Voting",
    description:
      "Voters choose For, Against, or Abstain. The proposal passes if it meets quorum and approval threshold.",
  },
  approval: {
    title: "Approval Voting",
    description:
      "Voters select from multiple options. Options are approved based on the criteria (threshold or top choices).",
  },
  optimistic: {
    title: "Optimistic Voting",
    description:
      "The proposal passes automatically unless enough voters veto it. Only vote if you want to block this proposal.",
  },
};

// Maps UI voting type to EAS schema voting type number
export const easVotingTypeToNumber: Record<EASVotingType, number> = {
  standard: 0,
  approval: 1,
  optimistic: 2,
} as const;

// Approval voting criteria
export type ApprovalCriteria = "threshold" | "top-choices";

export const approvalCriteriaOptions: Record<ApprovalCriteria, string> = {
  threshold: "Threshold (votes must exceed value)",
  "top-choices": "Top Choices (top N options win)",
} as const;

// Maps UI criteria to EAS schema criteria number
export const approvalCriteriaToNumber: Record<ApprovalCriteria, number> = {
  threshold: 0,
  "top-choices": 1,
} as const;

export interface RelatedItem {
  id: string;
  title: string;
  description: string;
  comments: number;
  timestamp: string;
  url?: string;
  status?: string;
  proposer?: string;
  proposalType?: {
    id: string;
    name: string;
    description: string;
    quorum: number;
    approvalThreshold: number;
    type?: string; // OPTIMISTIC, STANDARD, or APPROVAL
  };
}

export interface ProposalType {
  id: string;
  name: string;
  description: string;
  quorum: number;
  approvalThreshold: number;
  proposal_type_id?: string;
  module?: string;
}

// Approval voting option
export interface ApprovalOption {
  id: string;
  title: string;
  description?: string;
}

// Settings for approval voting proposals
export interface ApprovalProposalSettings {
  budget: number; // Maximum tokens that can be transferred
  maxApprovals: number; // How many options each voter can select
  criteria: ApprovalCriteria; // Threshold or Top Choices
  criteriaValue: number; // Threshold value or number of top choices
  choices: ApprovalOption[]; // The voting options
}

// Settings for optimistic voting proposals
export interface OptimisticProposalSettings {
  tiers: number[]; // Array of veto threshold percentages
}

export interface CreatePostFormData {
  title: string;
  description: string;
  proposalTypeId?: string;
  categoryId?: number;
  relatedDiscussions: RelatedItem[];
  relatedTempChecks: RelatedItem[];
  // New fields for voting type support
  votingType?: EASVotingType;
  approvalSettings?: ApprovalProposalSettings;
  optimisticSettings?: OptimisticProposalSettings;
}

// Default values for approval settings
export const defaultApprovalSettings: ApprovalProposalSettings = {
  budget: 0,
  maxApprovals: 1,
  criteria: "threshold",
  criteriaValue: 0,
  choices: [],
};

// Default values for optimistic settings
export const defaultOptimisticSettings: OptimisticProposalSettings = {
  tiers: [20], // Default 20% veto threshold
};
