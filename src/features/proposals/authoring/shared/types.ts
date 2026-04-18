import { TENANT_NAMESPACES } from "@/lib/constants";
import type { FormattedProposalType, TenantNamespace } from "@/lib/types";

export type AuthoringEntryType = "tempcheck" | "gov-proposal";

export const AUTHORING_ENTRY_TYPE_OPTIONS: Record<AuthoringEntryType, string> =
  {
    tempcheck: "Temp check",
    "gov-proposal": "Governance proposal",
  };

export type AuthoringVotingType = "standard" | "approval" | "optimistic";

export const AUTHORING_VOTING_TYPE_OPTIONS: Record<
  AuthoringVotingType,
  string
> = {
  standard: "Standard",
  approval: "Approval",
  optimistic: "Optimistic",
};

export type AuthoringVotingMetadata = {
  title: string;
  description: string;
};

export type AuthoringProposalMetadataKind = AuthoringVotingType | "social";

export const AUTHORING_VOTING_TYPE_METADATA: Record<
  AuthoringVotingType,
  AuthoringVotingMetadata
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

export const VOTING_TYPE_TO_NUMBER: Record<AuthoringVotingType, number> = {
  standard: 0,
  approval: 1,
  optimistic: 2,
};

export type AuthoringApprovalCriteria = "threshold" | "top-choices";

export const APPROVAL_CRITERIA_TO_NUMBER: Record<
  AuthoringApprovalCriteria,
  number
> = {
  threshold: 0,
  "top-choices": 1,
};

export type AuthoringApprovalOption = {
  id: string;
  title: string;
  description?: string;
};

export type AuthoringApprovalSettings = {
  budget: number;
  maxApprovals: number;
  criteria: AuthoringApprovalCriteria;
  criteriaValue: number;
  choices: AuthoringApprovalOption[];
};

export type AuthoringApprovalData = {
  choices: string[];
  maxApprovals: number;
  criteria: number;
  criteriaValue: number;
  budget: number;
};

export type AuthoringProposalTypeConfig = {
  id: string;
  name: string;
  description: string;
  quorum: number;
  approvalThreshold: number;
  module?: string;
  scopes?: unknown[];
};

export type AuthoringProposalTypeOption = FormattedProposalType & {
  module?: string | null;
};

export type AuthoringOptimisticSettings = {
  tiers: number[];
};

export const DEFAULT_AUTHORING_APPROVAL_SETTINGS: AuthoringApprovalSettings = {
  budget: 0,
  maxApprovals: 1,
  criteria: "threshold",
  criteriaValue: 0,
  choices: [],
};

export const DEFAULT_AUTHORING_OPTIMISTIC_SETTINGS: AuthoringOptimisticSettings =
  {
    tiers: [20],
  };

export function getAuthoringVotingTypeDescription(
  votingType: AuthoringVotingType,
  {
    namespace,
    includeAbstain = true,
  }: {
    namespace: TenantNamespace | string;
    includeAbstain?: boolean;
  }
): string {
  if (votingType === "standard" && namespace === TENANT_NAMESPACES.OPTIMISM) {
    if (!includeAbstain) {
      return "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold. \u26a0\ufe0f This option is currently not supported by the governor contract. \u26a0\ufe0f";
    }

    return "Voters are asked to vote for, against, or abstain. The proposal passes if the for and abstain votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold.";
  }

  return AUTHORING_VOTING_TYPE_METADATA[votingType].description;
}

export function getAuthoringVotingTypeMetadata(
  votingType: AuthoringVotingType,
  {
    namespace,
    includeAbstain = true,
    titleVariant = "voting",
  }: {
    namespace: TenantNamespace | string;
    includeAbstain?: boolean;
    titleVariant?: "voting" | "proposal";
  }
): AuthoringVotingMetadata {
  const titleByVariant: Record<
    "voting" | "proposal",
    Record<AuthoringVotingType, string>
  > = {
    voting: {
      standard: "Standard Voting",
      approval: "Approval Voting",
      optimistic: "Optimistic Voting",
    },
    proposal: {
      standard: "Basic Proposal",
      approval: "Approval Proposal",
      optimistic: "Optimistic Proposal",
    },
  };

  return {
    title: titleByVariant[titleVariant][votingType],
    description: getAuthoringVotingTypeDescription(votingType, {
      namespace,
      includeAbstain,
    }),
  };
}

export function getAuthoringProposalMetadata(
  proposalKind: AuthoringProposalMetadataKind,
  {
    namespace,
    includeAbstain = true,
  }: {
    namespace: TenantNamespace | string;
    includeAbstain?: boolean;
  }
): AuthoringVotingMetadata {
  if (proposalKind === "social") {
    return {
      title: "Social Proposal",
      description: "A proposal that resolves via a snapshot vote.",
    };
  }

  return getAuthoringVotingTypeMetadata(proposalKind, {
    namespace,
    includeAbstain,
    titleVariant: "proposal",
  });
}

export function getDraftAuthoringVotingType(
  votingModuleType: string
): AuthoringVotingType | null {
  return normalizeAuthoringVotingType(votingModuleType);
}

export function normalizeAuthoringVotingType(
  votingType?: string | null
): AuthoringVotingType | null {
  if (!votingType) {
    return null;
  }

  switch (votingType.toLowerCase()) {
    case "basic":
    case "standard":
      return "standard";
    case "approval":
      return "approval";
    case "optimistic":
      return "optimistic";
    default:
      return null;
  }
}
