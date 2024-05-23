"use client";

import {
  ProposalChecklist,
  ProposalSocialOption,
  ProposalStage,
} from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftForm from "./stages/DraftForm";
import SubmitForm from "./stages/SubmitForm";
import GithubPRForm from "./stages/GithubPRForm";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";

export default function DraftProposalForm({
  stage,
  draftProposal,
}: {
  stage: ProposalStage;
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
    checklist_items: ProposalChecklist[];
  };
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFT:
        return <DraftForm draftProposal={draftProposal} />;
      case ProposalStage.GITHUB_PR:
        return <GithubPRForm draftProposal={draftProposal} />;
      case ProposalStage.READY:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return renderStage(stage);
}
