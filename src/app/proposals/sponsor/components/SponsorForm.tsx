"use client";

import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import DraftPreview from "../../draft/components/DraftPreview";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "./SponsorActions";

const SponsorForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const methods = useForm({});
  return (
    <FormProvider {...methods}>
      <form>
        <DraftPreview
          proposalDraft={draftProposal}
          actions={<SponsorActions draftProposal={draftProposal} />}
        />
      </form>
    </FormProvider>
  );
};

export default SponsorForm;
