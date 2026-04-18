import type { ComponentType } from "react";

import {
  ApprovalProposal,
  BasicProposal,
  DraftProposal,
  DraftVotingModuleType,
  OptimisticProposal,
  SocialProposal,
} from "../../../proposals/draft/types";

import ApprovalProposalAction from "./ApprovalProposalAction";
import BasicProposalAction from "./BasicProposalAction";
import OptimisticProposalAction from "./OptimisticProposalAction";
import SocialProposalAction from "./SocialProposalAction";

export type SponsorActionProps = {
  draftProposal: DraftProposal;
};

export type SponsorActionComponent = ComponentType<SponsorActionProps>;

const BasicSponsorAction: SponsorActionComponent = ({ draftProposal }) => (
  <BasicProposalAction draftProposal={draftProposal as BasicProposal} />
);

const SocialSponsorAction: SponsorActionComponent = ({ draftProposal }) => (
  <SocialProposalAction draftProposal={draftProposal as SocialProposal} />
);

const ApprovalSponsorAction: SponsorActionComponent = ({ draftProposal }) => (
  <ApprovalProposalAction draftProposal={draftProposal as ApprovalProposal} />
);

const OptimisticSponsorAction: SponsorActionComponent = ({ draftProposal }) => (
  <OptimisticProposalAction
    draftProposal={draftProposal as OptimisticProposal}
  />
);

export const SPONSOR_ACTION_REGISTRY: Record<
  DraftVotingModuleType,
  SponsorActionComponent
> = {
  [DraftVotingModuleType.BASIC]: BasicSponsorAction,
  [DraftVotingModuleType.SOCIAL]: SocialSponsorAction,
  [DraftVotingModuleType.APPROVAL]: ApprovalSponsorAction,
  [DraftVotingModuleType.OPTIMISTIC]: OptimisticSponsorAction,
};

export function getSponsorActionComponent(
  draftProposal: DraftProposal
): SponsorActionComponent {
  return SPONSOR_ACTION_REGISTRY[draftProposal.voting_module_type];
}
