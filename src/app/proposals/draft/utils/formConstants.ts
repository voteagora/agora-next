import {
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
import { FormattedProposalType } from "@/lib/types";
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
  proposalTypes: FormattedProposalType[],
  proposalType: DraftVotingModuleType
): FormattedProposalType[] => {
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

  const withModule = proposalTypes as (FormattedProposalType & {
    module?: string;
  })[];

  return filterAuthoringProposalTypesByVotingType(withModule, proposalType, {
    approvalModuleAddress,
    optimisticModuleAddress,
  });
};
