"use client";

import { ProposalStage } from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm";
import SubmitForm from "./stages/SubmitForm";
import GithubPRForm from "./stages/GithubPRForm";
import { DraftProposal } from "../types";

export default function DraftProposalForm({
  stage,
  draftProposal,
  proposalTypes,
  rightColumn,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
  proposalTypes: any[];
  rightColumn: React.ReactElement;
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.ADDING_TEMP_CHECK:
        return (
          <TempCheckForm
            draftProposal={draftProposal}
            rightColumn={rightColumn}
          />
        );
      case ProposalStage.DRAFTING:
        return (
          <DraftForm
            proposalTypes={proposalTypes}
            draftProposal={draftProposal}
            rightColumn={rightColumn}
          />
        );
      case ProposalStage.ADDING_GITHUB_PR:
        return (
          <GithubPRForm
            draftProposal={draftProposal}
            rightColumn={rightColumn}
          />
        );
      case ProposalStage.AWAITING_SUBMISSION:
        return (
          <SubmitForm draftProposal={draftProposal} rightColumn={rightColumn} />
        );
      default:
        return null;
    }
  };

  return <>{renderStage(stage)}</>;
}
