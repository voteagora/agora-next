"use client";

import { ProposalLifecycleStage } from "../types";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm";
import SubmitForm from "./stages/SubmitForm";
import { ProposalDraft } from "@prisma/client";

export default function DraftProposalForm({
  stage,
  draftProposal,
}: {
  stage: ProposalLifecycleStage;
  draftProposal: ProposalDraft;
}) {
  const renderStage = (stage: ProposalLifecycleStage) => {
    switch (stage) {
      case ProposalLifecycleStage.TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalLifecycleStage.DRAFT:
        return <DraftForm draftProposal={draftProposal} />;
      case ProposalLifecycleStage.READY:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return renderStage(stage);
}
