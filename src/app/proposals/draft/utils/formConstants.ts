import {
  DraftProposalTypeOption,
  DraftVotingModuleType,
  SocialProposalType,
  ProposalScope,
} from "@/app/proposals/draft/types";
import {
  filterAuthoringProposalTypesByVotingType,
  getAuthoringProposalMetadata,
  getDraftAuthoringVotingType,
} from "@/features/proposals/authoring/shared";
import { getProposalTypeAddress } from "./stages";
import Tenant from "@/lib/tenant/tenant";

const { namespace } = Tenant.current();

export const getProposalMetadataDescription = (
  proposalType: DraftVotingModuleType,
  includeAbstain = true
) => {
  const authoringVotingType = getDraftAuthoringVotingType(proposalType);

  return getAuthoringProposalMetadata(authoringVotingType || "social", {
    namespace,
    includeAbstain,
  }).description;
};

export const DEFAULT_FORM = {
  type: DraftVotingModuleType.BASIC,
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
  proposalTypes: DraftProposalTypeOption[],
  proposalType: DraftVotingModuleType
): DraftProposalTypeOption[] => {
  let optimisticModuleAddress: string | null = null;
  let approvalModuleAddress: string | null = null;
  try {
    optimisticModuleAddress =
      getProposalTypeAddress(DraftVotingModuleType.OPTIMISTIC)?.toLowerCase() ||
      null;
    approvalModuleAddress =
      getProposalTypeAddress(DraftVotingModuleType.APPROVAL)?.toLowerCase() ||
      null;
  } catch {
    /* ignore */
  }

  return filterAuthoringProposalTypesByVotingType(proposalTypes, proposalType, {
    approvalModuleAddress,
    optimisticModuleAddress,
  });
};
