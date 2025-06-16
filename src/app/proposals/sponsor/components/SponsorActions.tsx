import BasicProposalAction from "./BasicProposalAction";
import SocialProposalAction from "./SocialProposalAction";
import ApprovalProposalAction from "./ApprovalProposalAction";
import OptimisticProposalAction from "./OptimisticProposalAction";
import { DraftProposal, ProposalType } from "../../../proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";
import { GOVERNOR_TYPE } from "@/lib/constants";
import AG20ProposalAction from "./AG20ProposalAction";

const { contracts } = Tenant.current();

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const renderAction = (proposal: DraftProposal) => {
    if (contracts.governorType === GOVERNOR_TYPE.AGORA_20) {
      return <AG20ProposalAction draftProposal={proposal} />;
    }
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
