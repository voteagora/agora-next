import BasicProposalAction from "./BasicProposalAction";
import SocialProposalAction from "./SocialProposalAction";
import { DraftProposal, ProposalType } from "../../../proposals/draft/types";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const renderAction = (proposal: DraftProposal) => {
    switch (proposal.proposal_type) {
      case ProposalType.BASIC:
        return <BasicProposalAction draftProposal={proposal} />;
      case ProposalType.SOCIAL:
        return <SocialProposalAction draftProposal={proposal} />;
      case ProposalType.APPROVAL:
        return null;
      case ProposalType.OPTIMISTIC:
        return null;
      default:
        // ensures that we've handled all cases
        const _exhaustiveCheck: never = proposal;
        throw new Error(`Unhandled proposal type: ${_exhaustiveCheck}`);
    }
  };

  return <div className="mt-6">{renderAction(draftProposal)}</div>;
};

export default SponsorActions;
