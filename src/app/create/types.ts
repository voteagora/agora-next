import {
  APPROVAL_CRITERIA_TO_NUMBER,
  AUTHORING_ENTRY_TYPE_OPTIONS,
  AUTHORING_POST_TYPE_OPTIONS,
  AUTHORING_VOTING_TYPE_OPTIONS,
  DEFAULT_AUTHORING_APPROVAL_SETTINGS,
  DEFAULT_AUTHORING_OPTIMISTIC_SETTINGS,
  VOTING_TYPE_TO_NUMBER,
  type AuthoringApprovalData,
  type AuthoringApprovalCriteria,
  type AuthoringApprovalOption,
  type AuthoringApprovalSettings,
  type AuthoringEntryType as SharedAuthoringEntryType,
  type AuthoringOptimisticSettings,
  type AuthoringPostType,
  type AuthoringProposalTypeConfig,
  type AuthoringVotingType,
} from "@/features/proposals/authoring/shared";

export type AuthoringEntryType = SharedAuthoringEntryType;
export type PostType = AuthoringPostType;

export const authoringEntryTypeOptions = AUTHORING_ENTRY_TYPE_OPTIONS;
export const postTypeOptions = AUTHORING_POST_TYPE_OPTIONS;

export type EASVotingType = AuthoringVotingType;

export const easVotingTypeOptions = AUTHORING_VOTING_TYPE_OPTIONS;

export const easVotingTypeToNumber = VOTING_TYPE_TO_NUMBER;

export type ApprovalCriteria = AuthoringApprovalCriteria;

export const approvalCriteriaToNumber = APPROVAL_CRITERIA_TO_NUMBER;

export interface RelatedItem {
  id: string;
  title: string;
  description: string;
  comments: number;
  timestamp: string;
  url?: string;
  status?: string;
  proposer?: string;
  proposalType?: AuthoringProposalTypeConfig & {
    type?: string; // OPTIMISTIC, STANDARD, or APPROVAL
  };
  // Approval-specific data from temp check
  approvalData?: AuthoringApprovalData;
  votingModule?: string;
}

export type ProposalType = AuthoringProposalTypeConfig;

// Approval voting option
export type ApprovalOption = AuthoringApprovalOption;

// Settings for approval voting proposals
export type ApprovalProposalSettings = AuthoringApprovalSettings;

// Settings for optimistic voting proposals
export type OptimisticProposalSettings = AuthoringOptimisticSettings;

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
export const defaultApprovalSettings = DEFAULT_AUTHORING_APPROVAL_SETTINGS;

// Default values for optimistic settings
export const defaultOptimisticSettings = DEFAULT_AUTHORING_OPTIMISTIC_SETTINGS;
