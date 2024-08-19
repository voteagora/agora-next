import BasicProposalAction from "./BasicProposalAction";
import SocialProposalAction from "./SocialProposalAction";
import ApprovalProposalAction from "./ApprovalProposalAction";
import OptimisticProposalAction from "./OptimisticProposalAction";
import { DraftProposal, ProposalType } from "../../../proposals/draft/types";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const renderAction = (proposal: DraftProposal) => {
    switch (proposal.voting_module_type) {
      case ProposalType.BASIC:
        return <BasicProposalAction draftProposal={proposal} />;
      case ProposalType.SOCIAL:
        return <SocialProposalAction draftProposal={proposal} />;
      case ProposalType.APPROVAL:
        return <ApprovalProposalAction draftProposal={proposal} />;
      case ProposalType.OPTIMISTIC:
        return <OptimisticProposalAction draftProposal={proposal} />;
      default:
        // ensures that we've handled all cases
        const _exhaustiveCheck: never = proposal;
        throw new Error(`Unhandled proposal type.`);
    }
  };

  return <div className="mt-6">{renderAction(draftProposal)}</div>;
};

export default SponsorActions;
