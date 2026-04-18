import type {
  AuthoringApprovalCriteria,
  AuthoringApprovalData,
  AuthoringApprovalOption,
  AuthoringApprovalSettings,
  AuthoringEntryType,
  AuthoringProposalTypeConfig,
} from "./types";
import { normalizeAuthoringVotingType } from "./types";

type AuthoringProposalTypeRecord = {
  module?: string | null;
};

type AuthoringNamedProposalTypeRecord = AuthoringProposalTypeRecord & {
  name: string;
};

type AuthoringProposalTypeLabelRecord = {
  name: string;
  quorum: number;
  approval_threshold: number;
};

type AuthoringProposalTypeOptionRecord = AuthoringProposalTypeLabelRecord & {
  proposal_type_id: string | number;
};

type AuthoringApprovalDataSource = {
  kwargs?: {
    choices?: unknown;
    max_approvals?: unknown;
    criteria?: unknown;
    criteria_value?: unknown;
    budget?: unknown;
  } | null;
  choices?: string[] | null;
  max_approvals?: number | null;
  criteria?: number | null;
  criteria_value?: number | null;
  budget?: number | null;
};

type AuthoringProposalTypeConfigSource = {
  id: string | number;
  name: string;
  description?: string | null;
  quorum: number;
  approvalThreshold: number;
  module?: string | null;
  scopes?: unknown[];
};

export function filterAuthoringProposalTypesByEntryType<
  T extends AuthoringProposalTypeRecord,
>(proposalTypes: T[], entryType: AuthoringEntryType): T[] {
  return proposalTypes.filter(
    (proposalType) =>
      proposalType.module?.toLowerCase() === entryType.toLowerCase()
  );
}

export function getAuthoringApprovalCriteria(
  criteria: number
): AuthoringApprovalCriteria {
  return criteria === 0 ? "threshold" : "top-choices";
}

export function normalizeAuthoringProposalTypeConfig(
  source: AuthoringProposalTypeConfigSource
): AuthoringProposalTypeConfig {
  return {
    id: String(source.id),
    name: source.name,
    description: source.description || "",
    quorum: Number(source.quorum) / 100,
    approvalThreshold: Number(source.approvalThreshold) / 100,
    module: source.module || undefined,
    scopes: source.scopes || [],
  };
}

export function formatAuthoringProposalTypeLabel(
  proposalType: AuthoringProposalTypeLabelRecord
): string {
  return `${proposalType.name} (${proposalType.quorum / 100}% Quorum, ${proposalType.approval_threshold / 100}% Approval)`;
}

export function toAuthoringProposalTypeSelectOption(
  proposalType: AuthoringProposalTypeOptionRecord
): {
  label: string;
  value: string;
} {
  return {
    label: formatAuthoringProposalTypeLabel(proposalType),
    value: proposalType.proposal_type_id.toString(),
  };
}

export function filterAuthoringProposalTypesByVotingType<
  T extends AuthoringNamedProposalTypeRecord,
>(
  proposalTypes: T[],
  votingType: string,
  {
    approvalModuleAddress,
    optimisticModuleAddress,
  }: {
    approvalModuleAddress?: string | null;
    optimisticModuleAddress?: string | null;
  } = {}
): T[] {
  const normalizedVotingType = normalizeAuthoringVotingType(votingType);
  const normalizedApprovalModuleAddress =
    approvalModuleAddress?.toLowerCase() || null;
  const normalizedOptimisticModuleAddress =
    optimisticModuleAddress?.toLowerCase() || null;

  if (!normalizedVotingType) {
    return proposalTypes;
  }

  return proposalTypes.filter((proposalType) => {
    const moduleAddress = proposalType.module?.toLowerCase() || null;
    const name = proposalType.name.toLowerCase();
    const isApprovalType =
      (normalizedApprovalModuleAddress !== null &&
        moduleAddress === normalizedApprovalModuleAddress) ||
      name.includes("approval");
    const isOptimisticType =
      (normalizedOptimisticModuleAddress !== null &&
        moduleAddress === normalizedOptimisticModuleAddress) ||
      name.includes("optimistic");

    switch (normalizedVotingType) {
      case "approval":
        return isApprovalType;
      case "optimistic":
        return isOptimisticType;
      case "standard":
        return !isApprovalType && !isOptimisticType;
      default:
        return false;
    }
  });
}

export function extractAuthoringApprovalData(
  source: AuthoringApprovalDataSource
): AuthoringApprovalData {
  const kwargs = source.kwargs || {};

  return {
    choices: Array.isArray(kwargs.choices)
      ? (kwargs.choices as string[])
      : source.choices || [],
    maxApprovals:
      typeof kwargs.max_approvals === "number"
        ? kwargs.max_approvals
        : source.max_approvals || 1,
    criteria:
      typeof kwargs.criteria === "number"
        ? kwargs.criteria
        : source.criteria || 0,
    criteriaValue:
      typeof kwargs.criteria_value === "number"
        ? kwargs.criteria_value
        : source.criteria_value || 0,
    budget:
      typeof kwargs.budget === "number" ? kwargs.budget : source.budget || 0,
  };
}

export function getApprovalSettingsFromAuthoringData(
  approvalData: AuthoringApprovalData
): AuthoringApprovalSettings {
  return {
    budget: approvalData.budget,
    maxApprovals: approvalData.maxApprovals,
    criteria: getAuthoringApprovalCriteria(approvalData.criteria),
    criteriaValue: approvalData.criteriaValue,
    choices: approvalData.choices.map<AuthoringApprovalOption>(
      (choice, index) => ({
        id: `choice-${index}`,
        title: choice,
      })
    ),
  };
}
