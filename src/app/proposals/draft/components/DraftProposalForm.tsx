import { Suspense } from "react";
import { ProposalStage } from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm/DraftForm";
import DraftFormServer from "./stages/DraftForm/DraftFormServer";
import SubmitForm from "./stages/SubmitForm";
import GithubPRForm from "./stages/GithubPRForm";
import { DraftProposal } from "../types";
import CreatorAuthCheck from "./CreatorAuthCheck";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";

export default function DraftProposalForm({
  stage,
  draftProposal,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.ADDING_TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFTING:
        return (
          <Suspense fallback={"loading!"}>
            <DraftFormServer draftProposal={draftProposal} />
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
  return (
    <CreatorAuthCheck
      creatorAddress={draftProposal.author_address as `0x${string}`}
    >
      {renderStage(stage)}
    </CreatorAuthCheck>
  );
}
