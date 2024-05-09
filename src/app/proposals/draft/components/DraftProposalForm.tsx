"use client";

import { ProposalStage } from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm";
import SubmitForm from "./stages/SubmitForm";
import { ProposalDraft } from "@prisma/client";

export default function DraftProposalForm({
  stage,
  draftProposal,
}: {
  stage: ProposalStage;
  draftProposal: ProposalDraft;
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFT:
        return <DraftForm draftProposal={draftProposal} />;
      case ProposalStage.READY:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return renderStage(stage);
}
