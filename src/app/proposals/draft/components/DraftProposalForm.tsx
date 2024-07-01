"use client";

import { useAccount } from "wagmi";
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
  const { address, isConnecting, isReconnecting } = useAccount();

  if (isConnecting || isReconnecting) {
    return <div>Connecting...</div>;
  }

  if (draftProposal.author_address !== address) {
    return <div>You are not the author of this proposal.</div>;
  }

  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.ADDING_TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFTING:
        return <DraftForm draftProposal={draftProposal} />;
      case ProposalStage.ADDING_GITHUB_PR:
        return <GithubPRForm draftProposal={draftProposal} />;
      case ProposalStage.AWAITING_SUBMISSION:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return renderStage(stage);
}
