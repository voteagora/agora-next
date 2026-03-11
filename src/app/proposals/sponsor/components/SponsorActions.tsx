import BasicProposalAction from "./BasicProposalAction";
import SocialProposalAction from "./SocialProposalAction";
import ApprovalProposalAction from "./ApprovalProposalAction";
import OptimisticProposalAction from "./OptimisticProposalAction";
import {
  DraftProposal,
  ProposalScope,
  ProposalType,
} from "../../../proposals/draft/types";
import OffchainProposalAction from "./OffchainProposalAction";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const proposal_scope = draftProposal.proposal_scope;
  const isHybrid = proposal_scope === ProposalScope.HYBRID;
  const isOffchainOnly = proposal_scope === ProposalScope.OFFCHAIN_ONLY;

  const renderOnchainAction = (proposal: DraftProposal) => {
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

  const renderAction = (proposal: DraftProposal) => {
    if (isOffchainOnly) {
      return <OffchainProposalAction draftProposal={proposal} />;
    }

    if (isHybrid) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Step 1: Submit on-chain
            </h4>
            {renderOnchainAction(proposal)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Step 2: Submit off-chain
            </h4>
            <OffchainProposalAction draftProposal={proposal} />
          </div>
        </div>
      );
    }

    return renderOnchainAction(proposal);
  };

  return (
    <div className="mt-6">
      {isHybrid && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Hybrid Proposal</h3>
          <p className="text-sm text-blue-800">
            This proposal will be submitted both on-chain and off-chain. Voting
            will occur across both platforms.
          </p>
        </div>
      )}
      {renderAction(draftProposal)}
    </div>
  );
};

export default SponsorActions;
