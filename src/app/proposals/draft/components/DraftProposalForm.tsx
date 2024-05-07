"use client";

import { ProposalLifecycleStage } from "../types";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm";
import SubmitForm from "./stages/SubmitForm";

export default function DraftProposalForm({
  stage,
}: {
  stage: ProposalLifecycleStage;
}) {
  const renderStage = (stage: ProposalLifecycleStage) => {
    switch (stage) {
      case ProposalLifecycleStage.TEMP_CHECK:
        return <TempCheckForm />;
      case ProposalLifecycleStage.DRAFT:
        return <DraftForm />;
      case ProposalLifecycleStage.READY:
        return <SubmitForm />;
      default:
        return null;
    }
  };
  return renderStage(stage);
}
