import {
  ProposalType,
  SocialProposalType,
  ProposalScope,
} from "@/app/proposals/draft/types";
import { getProposalTypeAddress } from "./stages";
import { FormattedProposalType } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const { namespace } = Tenant.current();

export const ProposalTypeMetadata: Record<
  ProposalType,
  { title: string; description: string }
> = {
  [ProposalType.SOCIAL]: {
    title: "Social Proposal",
    description: "A proposal that resolves via a snapshot vote.",
  },
  [ProposalType.BASIC]: {
    title: "Basic Proposal",
    description:
      namespace === "optimism"
        ? "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes exceed the approval threshold."
        : "Voters are asked to vote for, against, or abstain. The proposal passes if the abstain and for votes exceed quorum AND if the for votes exceed the approval threshold.",
  },
  [ProposalType.APPROVAL]: {
    title: "Approval Proposal",
    description:
      "Voters are asked to choose among multiple options. If the proposal passes quorum, options will be approved according to the approval criteria.",
  },
  [ProposalType.OPTIMISTIC]: {
    title: "Optimistic Proposal",
    description:
      "Voters are asked to vote for, against, or abstain. The proposal automatically passes unless 12% vote against. No transactions can be proposed for optimistic proposals.",
  },
  [ProposalType.OPTMISTIC_EXECUTABLE]: {
    title: "Optimistic Executable Proposal",
    description:
      "Voters are asked to vote for, against, or abstain. The proposal automatically passes unless 12% vote against. Transactions can be proposed for optimistic executable proposals.",
  },
};

export const getProposalMetadataDescription = (
  proposalType: ProposalType,
  includeAbstain = true
) => {
  if (
    proposalType === ProposalType.BASIC &&
    namespace === TENANT_NAMESPACES.OPTIMISM
  ) {
    if (!includeAbstain) {
      return "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold. ⚠️ This option is currently not supported by the governor contract. ⚠️";
    }
    return "Voters are asked to vote for, against, or abstain. The proposal passes if the for and abstain votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold.";
  }
  return ProposalTypeMetadata[proposalType]?.description ?? "";
};

export const DEFAULT_FORM = {
  type: ProposalType.BASIC,
  title: "",
  abstract: "",
  transactions: [],
  socialProposal: {
    type: SocialProposalType.BASIC,
    start_date: undefined,
    end_date: undefined,
    options: [],
  },
  proposal_scope: ProposalScope.ONCHAIN_ONLY,
  budget: 0,
  calculationOptions: 0,
};

export const getValidProposalTypesForVotingType = (
  proposalTypes: FormattedProposalType[],
  proposalType: ProposalType
): FormattedProposalType[] => {
  let optimisticModuleAddress: string | null = null;
  let approvalModuleAddress: string | null = null;
  let optimisticExecutableModuleAddress: string | null = null;
  try {
    optimisticModuleAddress =
      getProposalTypeAddress(ProposalType.OPTIMISTIC)?.toLowerCase() || null;
    optimisticExecutableModuleAddress =
      getProposalTypeAddress(
        ProposalType.OPTMISTIC_EXECUTABLE
      )?.toLowerCase() || null;
    approvalModuleAddress =
      getProposalTypeAddress(ProposalType.APPROVAL)?.toLowerCase() || null;
  } catch {
    /* ignore */
  }

  const withModule = proposalTypes as (FormattedProposalType & {
    module?: string;
  })[];
  switch (proposalType) {
    case ProposalType.APPROVAL:
      return withModule.filter(
        (type) =>
          type.module?.toLowerCase() === approvalModuleAddress?.toLowerCase() ||
          type.name.toLowerCase().includes("approval")
      );
    case ProposalType.OPTIMISTIC:
      return withModule.filter(
        (type) =>
          type.module?.toLowerCase() ===
            optimisticModuleAddress?.toLowerCase() ||
          type.name.toLowerCase().includes("optimistic")
      );

    case ProposalType.OPTMISTIC_EXECUTABLE:
      return withModule.filter(
        (type) =>
          type.module?.toLowerCase() ===
            optimisticExecutableModuleAddress?.toLowerCase() ||
          type.name.toLowerCase().includes("optimistic executable")
      );
    case ProposalType.BASIC:
      return withModule.filter(
        (type) =>
          (!type.module ||
            type.module?.toLowerCase() !==
              approvalModuleAddress?.toLowerCase()) &&
          (!type.module ||
            type.module?.toLowerCase() !==
              optimisticModuleAddress?.toLowerCase()) &&
          (!type.module ||
            type.module?.toLowerCase() !==
              optimisticExecutableModuleAddress?.toLowerCase()) &&
          !type.name.toLowerCase().includes("approval") &&
          !type.name.toLowerCase().includes("optimistic")
      );
    case ProposalType.SOCIAL:
    default:
      return withModule;
  }
};
