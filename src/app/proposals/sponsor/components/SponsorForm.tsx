import DraftPreview from "../../draft/components/DraftPreview";
import SponsorActions from "./SponsorActions";
import { DraftProposal } from "../../../proposals/draft/types";

const SponsorForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
  return (
    <DraftPreview
      proposalDraft={draftProposal}
      actions={<SponsorActions draftProposal={draftProposal} />}
    />
  );
};

export default SponsorForm;
