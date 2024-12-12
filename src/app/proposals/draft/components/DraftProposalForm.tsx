import { Suspense } from "react";
import { ProposalStage } from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftFormClient from "./stages/DraftForm/DraftFormClient";
import SubmitForm from "./stages/SubmitForm";
import GithubPRForm from "./stages/GithubPRForm";
import { DraftProposal } from "../types";

export default function DraftProposalForm({
  stage,
  draftProposal,
  proposalTypes,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
  proposalTypes: any[];
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.ADDING_TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFTING:
        return (
          <Suspense fallback={"loading!"}>
            <DraftFormClient
              proposalTypes={proposalTypes}
              draftProposal={draftProposal}
            />
          </Suspense>
        );
      case ProposalStage.ADDING_GITHUB_PR:
        return <GithubPRForm draftProposal={draftProposal} />;
      case ProposalStage.AWAITING_SUBMISSION:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return <>{renderStage(stage)}</>;
}
