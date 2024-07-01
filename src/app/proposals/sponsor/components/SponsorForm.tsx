import {
  ProposalChecklist,
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import DraftPreview from "../../draft/components/DraftPreview";
import SponsorActions from "./SponsorActions";

const SponsorForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
    checklist_items: ProposalChecklist[];
  };
}) => {
  return (
    <DraftPreview
      proposalDraft={draftProposal}
      actions={<SponsorActions draftProposal={draftProposal} />}
    />
  );
};

export default SponsorForm;
